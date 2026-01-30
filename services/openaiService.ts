
import { storageService } from './storageService';
import { Transaction } from '../types';

interface OpenAIResponse {
    choices: {
        message: {
            content: string | null;
            tool_calls?: {
                id: string;
                type: 'function';
                function: {
                    name: string;
                    arguments: string;
                };
            }[];
        };
    }[];
    error?: {
        message: string;
    };
}

export const askOpenAI = async (prompt: string, context: string = '', companyId?: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
        console.error("OpenAI API Key not found. Please set VITE_OPENAI_API_KEY in .env.local");
        return "Erro: Chave de API do OpenAI não configurada.";
    }

    const tools = [
        {
            type: "function",
            function: {
                name: "add_transaction",
                description: "Adiciona uma nova transação financeira no sistema.",
                parameters: {
                    type: "object",
                    properties: {
                        description: { type: "string" },
                        amount: { type: "number" },
                        type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                        category: { type: "string" },
                        date: { type: "string" }
                    },
                    required: ["description", "amount", "type"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "add_task",
                description: "Cria uma nova tarefa em um projeto.",
                parameters: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "O título ou conteúdo da tarefa." },
                        column: { type: "string", enum: ["TODO", "DOING", "DONE"], description: "Coluna inicial. Padrão: TODO" },
                        projectName: { type: "string", description: "Nome do projeto alvo (ex: 'Marketing', 'Leandro'). Se não informado, tenta o padrão." }
                    },
                    required: ["title"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "get_financial_balance",
                description: "Obtém um resumo financeiro (saldo, receitas, despesas) do mês atual.",
                parameters: {
                    type: "object",
                    properties: {},
                    required: []
                }
            }
        },
        {
            type: "function",
            function: {
                name: "create_deal_from_client",
                description: "Cria um novo negócio/oportunidade no CRM para um cliente existente.",
                parameters: {
                    type: "object",
                    properties: {
                        clientName: { type: "string", description: "Nome do cliente ou empresa." },
                        dealTitle: { type: "string", description: "Título do negócio (ex: 'Projeto Site')." },
                        value: { type: "number", description: "Valor estimado do negócio." }
                    },
                    required: ["clientName", "dealTitle", "value"]
                }
            }
        }
    ];

    const messages = [
        {
            role: "system",
            content: `Você é um assistente útil integrado a um sistema de gerenciamento de trabalho para dois parceiros chamado PartnerSync.
      
      Contexto atual:
      ${context}
      
      Você tem permissão para realizar ações no sistema usando as ferramentas disponíveis.
      Hoje é: ${new Date().toLocaleDateString('pt-BR')}
      
      Responda de forma concisa, útil e amigável.`
        },
        {
            role: "user",
            content: prompt
        }
    ];

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                tools: tools,
                tool_choice: "auto",
                temperature: 0.7
            })
        });

        if (!response.ok) {
            let errorMsg = response.statusText;
            try {
                const errData = await response.json();
                errorMsg = errData.error?.message || errorMsg;
            } catch (e) { }
            console.error("OpenAI HTTP Error:", response.status, errorMsg);
            return `Erro na API da OpenAI: ${errorMsg}`;
        }

        const data: OpenAIResponse = await response.json();

        if (data.error) {
            console.error("OpenAI API Error:", data.error);
            return `Erro na API: ${data.error.message}`;
        }

        const message = data.choices[0]?.message;

        if (message?.tool_calls && message.tool_calls.length > 0) {
            if (!companyId) return "Erro: Falta o ID da empresa para executar essa ação.";

            const toolCall = message.tool_calls[0];
            const args = JSON.parse(toolCall.function.arguments);
            let functionResult = "";

            try {
                if (toolCall.function.name === 'add_transaction') {
                    console.log("Executing Tool: add_transaction", args);
                    const transaction: Transaction = {
                        id: '',
                        companyId: companyId,
                        description: args.description,
                        amount: Number(args.amount),
                        type: args.type,
                        category: args.category || 'Geral',
                        date: args.date || new Date().toISOString(),
                        status: args.type === 'INCOME' ? 'PAID' : 'PENDING',
                        createdAt: Date.now(),
                        createdBy: 'AI Assistant'
                    };
                    if (args.type === 'INCOME') transaction.status = 'PAID';
                    else transaction.status = 'PENDING';

                    await storageService.saveTransaction(transaction);
                    functionResult = `Transação adicionada: ${args.type} - R$ ${args.amount}`;
                }
                else if (toolCall.function.name === 'add_task') {
                    console.log("Executing Tool: add_task", args);
                    // Assuming addTaskToProject is now fixed in storageService to allow 4 args
                    const projectName = await storageService.addTaskToProject(companyId, args.title, args.column || 'TODO', args.projectName);
                    functionResult = `Tarefa criada com sucesso no projeto "${projectName}": ${args.title}`;
                }
                else if (toolCall.function.name === 'get_financial_balance') {
                    console.log("Executing Tool: get_financial_balance");
                    functionResult = await storageService.getFinancialReport(companyId);
                }
                else if (toolCall.function.name === 'create_deal_from_client') {
                    console.log("Executing Tool: create_deal_from_client", args);
                    const client = await storageService.getClientByName(companyId, args.clientName);

                    if (!client) {
                        functionResult = `Erro: Cliente "${args.clientName}" não encontrado.`;
                    } else {
                        const dealTitle = await storageService.addDeal(companyId, {
                            clientId: client.id,
                            title: args.dealTitle,
                            value: args.value,
                            probability: 50 // Standard start
                        });
                        functionResult = `Negócio criado com sucesso para ${client.name}: "${dealTitle}".`;
                    }
                }

                const toolResponse = {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: functionResult
                };

                const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [...messages, message, toolResponse]
                    })
                });

                const secondData = await secondResponse.json();
                return secondData.choices[0]?.message?.content || "Ação realizada!";

            } catch (err) {
                console.error("Tool Execution Error:", err);
                let errorMessage = "Erro ao executar ação.";
                if (err instanceof Error) errorMessage = err.message;
                return `Erro: ${errorMessage}`;
            }
        }

        return message?.content || "Desculpe, não consegui gerar uma resposta.";
    } catch (error) {
        console.error("Network Error calling OpenAI:", error);
        return "Erro de conexão ao tentar falar com o ChatGPT.";
    }
};
