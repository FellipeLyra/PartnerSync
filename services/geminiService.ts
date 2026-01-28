import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getClient = () => {
  if (!genAI) {
    if (process.env.API_KEY) {
      genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }
  return genAI;
};

export const askGemini = async (prompt: string, context: string = ''): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "API Key não configurada. Por favor configure a API Key no ambiente.";
  }

  try {
    const model = "gemini-3-flash-preview"; 
    
    // Construct a helpful system-like prompt
    const fullPrompt = `
      Você é um assistente útil integrado a um sistema de gerenciamento de trabalho para dois parceiros.
      
      Contexto atual do sistema:
      ${context}

      Usuário perguntou: ${prompt}

      Responda de forma concisa, útil e amigável. Se for sobre código ou tarefas, seja prático.
    `;

    const response = await client.models.generateContent({
      model: model,
      contents: fullPrompt,
    });

    return response.text || "Desculpe, não consegui gerar uma resposta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao contatar o Gemini AI.";
  }
};