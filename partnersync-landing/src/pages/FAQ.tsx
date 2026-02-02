import React, { useState } from 'react';

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: 'Quanto tempo leva para ver resultados?',
            answer: 'Os primeiros resultados geralmente aparecem entre 15-30 dias. Resultados mais significativos são observados após 90 dias de trabalho consistente.'
        },
        {
            question: 'Qual é o investimento mínimo?',
            answer: 'Nossos pacotes começam a partir de R$ 797/mês. O investimento ideal depende dos seus objetivos e do escopo do projeto.'
        },
        {
            question: 'Vocês trabalham com qual tipo de negócio?',
            answer: 'Atendemos diversos segmentos: e-commerce, serviços, clínicas, academias, restaurantes, consultoria e muito mais.'
        },
        {
            question: 'Como funciona o processo de contratação?',
            answer: 'Primeiro, fazemos uma consulta gratuita para entender suas necessidades. Depois, apresentamos uma proposta personalizada. Aprovada a proposta, iniciamos o trabalho em até 48h.'
        },
        {
            question: 'Preciso ter um grande orçamento para tráfego pago?',
            answer: 'Não necessariamente. Começamos com orçamentos a partir de R$ 500/mês em mídia e otimizamos conforme os resultados aparecem.'
        },
        {
            question: 'Vocês criam conteúdo para todas as redes sociais?',
            answer: 'Sim! Criamos conteúdo para Instagram, Facebook, TikTok, LinkedIn, YouTube e outras plataformas relevantes para seu negócio.'
        },
        {
            question: 'Posso cancelar o serviço a qualquer momento?',
            answer: 'Sim. Trabalhamos com contratos mensais e você pode cancelar com 30 dias de antecedência.'
        },
        {
            question: 'Como acompanho os resultados?',
            answer: 'Fornecemos relatórios mensais detalhados e você tem acesso a um dashboard em tempo real para acompanhar as métricas.'
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="pt-20 bg-bg-primary">
            <section className="bg-bg-secondary py-24 text-center text-text-primary border-b border-border">
                <div className="container mx-auto px-6">
                    <h1 className="animate-fadeInUp text-4xl md:text-5xl font-bold mb-6">Perguntas Frequentes</h1>
                    <p className="max-w-[700px] mx-auto text-xl text-text-secondary animate-fadeInUp">
                        Tire suas dúvidas sobre nossos serviços e processos
                    </p>
                </div>
            </section>

            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="max-w-[800px] mx-auto flex flex-col gap-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`
                                    rounded-2xl p-6 cursor-pointer transition-all duration-300 bg-white border border-border glass group
                                    ${openIndex === index ? 'border-primary shadow-md' : 'hover:shadow-md hover:border-primary-light'}
                                `}
                                onClick={() => toggleFAQ(index)}
                            >
                                <div className="flex justify-between items-center gap-4">
                                    <h3 className="m-0 text-lg font-semibold text-text-primary">{faq.question}</h3>
                                    <span className="text-xl font-normal text-text-tertiary flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-bg-secondary transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                                        {openIndex === index ? '−' : '+'}
                                    </span>
                                </div>
                                {openIndex === index && (
                                    <div className="mt-4 pt-4 border-t border-border animate-fadeIn">
                                        <p className="text-text-secondary leading-relaxed m-0">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="glass rounded-2xl p-16 text-center border border-white/20">
                        <h2 className="text-3xl font-bold mb-4">Ainda tem dúvidas?</h2>
                        <p className="text-lg text-text-secondary mb-8">Entre em contato conosco e teremos prazer em ajudar</p>
                        <a href="/contato" className="btn btn-primary btn-lg inline-flex">Falar com Especialista</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FAQ;
