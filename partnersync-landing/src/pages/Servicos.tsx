import React from 'react';

interface ServiceItem {
    title: string;
    icon: string;
    description: string;
    features: string[];
    results: string;
    highlight?: boolean;
    fullWidth?: boolean;
}

const Servicos: React.FC = () => {
    const processSteps = [
        {
            step: '01',
            title: 'Diagnóstico',
            desc: 'Análise profunda do seu momento, concorrência e oportunidades ocultas.'
        },
        {
            step: '02',
            title: 'Estratégia',
            desc: 'Plano de ação personalizado unindo tráfego, conteúdo e conversão.'
        },
        {
            step: '03',
            title: 'Escala',
            desc: 'Execução de alta performance e otimização contínua para maximizar ROI.'
        }
    ];

    const services: ServiceItem[] = [
        {
            title: 'Pacote Growth (Aceleração)',
            icon: '🚀',
            description: 'A solução definitiva para quem não quer brincar de empreender. Unimos todas as pontas do marketing digital em uma máquina de vendas previsível.',
            features: [
                'Gestão completa de Tráfego Pago (Ads)',
                'Produção de Conteúdo Estratégico',
                'Copywriting & Scripts de Vendas',
                'Consultoria Mensal de Negócios',
                'Relatórios de Performance em Tempo Real'
            ],
            results: 'Crescimento Médio: +200%',
            highlight: true
        },
        {
            title: 'Gestão de Tráfego',
            icon: '📈',
            description: 'Compramos dinheiro com desconto. Campanhas matematicamente otimizadas para colocar seu produto na frente de quem já quer comprar.',
            features: ['Facebook & Instagram Ads', 'Google & YouTube Ads', 'Remarketing Inteligente', 'Dashboards ao vivo'],
            results: 'ROI Médio: 4.8x'
        },
        {
            title: 'Social Media & Conteúdo',
            icon: '🎨',
            description: 'Transformamos seguidores em fãs e fãs em clientes. Conteúdo intencional que constrói autoridade e desejo de compra.',
            features: ['Design Premium', 'Edição de Vídeos Virais (Reels)', 'Gestão de Comunidade', 'Calendário Editorial'],
            results: 'Engajamento: +250%'
        },
        {
            title: 'Sites & Landing Pages',
            icon: '💻',
            description: 'Páginas que não apenas informam, mas convertem. Design persuasivo otimizado para transformar visitantes em leads qualificados.',
            features: ['Design de Alta Conversão', 'Copywriting Persuasivo', 'Velocidade Extrema', 'Otimização Mobile'],
            results: 'Conversão: +180%'
        }
    ];

    return (
        <div className="bg-bg-primary text-text-primary overflow-hidden">
            {/* HERO */}
            <section className="relative py-32 text-center bg-bg-secondary/30">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="animate-fadeInUp">
                        <span className="inline-block px-4 py-2 bg-white border border-primary/10 text-primary font-bold text-xs rounded-full mb-8 shadow-sm tracking-widest uppercase">
                            Especialistas em Crescimento
                        </span>
                        <h1 className="text-text-primary mb-8 max-w-[900px] mx-auto text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                            Não vendemos serviços.<br />Vendemos <span className="text-transparent bg-clip-text bg-gradient-primary">Resultados.</span>
                        </h1>
                        <p className="max-w-[700px] mx-auto text-xl text-text-secondary leading-relaxed mb-10">
                            Uma abordagem cirúrgica para escalar sua empresa. Sem "achismos", apenas dados, estratégia e execução impecável.
                        </p>
                    </div>
                </div>
            </section>

            {/* PROCESS SECTION */}
            <section className="section py-24 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Como Geramos Valor</h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">Nosso método proprietário de 3 etapas para garantir o sucesso do projeto.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 z-0"></div>

                        {processSteps.map((step, index) => (
                            <div
                                key={index}
                                className="bg-white p-10 rounded-3xl border border-border relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 animate-fadeInUp group z-10"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bg-secondary to-white border border-border flex items-center justify-center text-4xl font-black text-text-primary mb-8 shadow-inner group-hover:scale-110 transition-transform duration-300 mx-auto md:mx-0">
                                    <span className="bg-clip-text text-transparent bg-gradient-primary">{step.step}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-text-primary group-hover:text-primary transition-colors">{step.title}</h3>
                                <p className="text-text-secondary leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES GRID */}
            <section className="section py-24 bg-bg-secondary relative">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Aplicações Táticas</h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">Ferramentas que usamos para executar a estratégia desenhada para você.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={`
                                    flex flex-col p-8 bg-white/80 backdrop-blur-sm border border-border rounded-3xl transition-all duration-300 h-full hover:shadow-2xl hover:border-primary/30 animate-fadeInUp group
                                    ${service.highlight ? 'border-primary ring-4 ring-primary/5 shadow-xl scale-[1.02] z-10' : 'hover:-translate-y-1'}
                                    ${service.fullWidth ? 'lg:col-span-full lg:grid lg:grid-cols-[1fr_1fr_250px] lg:items-center lg:gap-12 lg:text-left' : ''}
                                `}
                            >
                                {service.highlight && (
                                    <div className="bg-gradient-primary text-white text-xs font-bold px-4 py-1.5 rounded-full absolute -top-4 left-1/2 -translate-x-1/2 uppercase tracking-wider shadow-lg shadow-primary/30">
                                        Mais Escolhido
                                    </div>
                                )}

                                <div className={`card-header ${service.fullWidth ? 'w-full' : ''}`}>
                                    <div className="text-5xl mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 inline-block">{service.icon}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-primary transition-colors">{service.title}</h3>
                                        <p className="text-text-secondary mb-6 flex-grow leading-relaxed">{service.description}</p>
                                    </div>
                                </div>

                                <div className={`card-body ${service.fullWidth ? 'w-full' : ''}`}>
                                    <ul className={`space-y-4 mb-8 ${service.fullWidth ? 'border-t-0 pt-0 mb-0' : 'border-t border-border/50 pt-8'}`}>
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-text-secondary text-sm group/item">
                                                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-success/20 transition-colors">
                                                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="text-success">
                                                        <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {!service.fullWidth && (
                                        <div className="bg-bg-secondary/50 border border-border/50 p-4 rounded-xl flex items-center gap-3 mb-8">
                                            <span className="text-xl">⚡</span>
                                            <span className="font-bold text-text-primary text-sm">{service.results}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={`card-footer mt-auto ${service.fullWidth ? 'w-full' : ''}`}>
                                    {service.fullWidth && (
                                        <div className="bg-bg-secondary p-4 rounded-lg flex items-center gap-3 mb-6 font-semibold text-text-primary">
                                            <span className="">⚡</span>
                                            <span className="">{service.results}</span>
                                        </div>
                                    )}
                                    <a
                                        href="/contato"
                                        className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all duration-300 ${service.highlight
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1'
                                            : 'bg-white border-2 border-primary/10 text-primary hover:border-primary hover:bg-primary hover:text-white'
                                            }`}
                                    >
                                        Solicitar Análise
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONSULTATIVE CTA */}
            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="bg-bg-primary rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-16 border border-border shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-primary opacity-5 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="flex-1 text-center md:text-left relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-text-primary">Por que não temos uma tabela de preços fixa?</h2>
                            <p className="text-xl text-text-secondary leading-relaxed mb-10">
                                Porque seu negócio não é um "pacote padrão". Um e-commerce de moda cria necessidades
                                completamente diferentes de uma clínica de estética.
                                <br /><br />
                                <strong className="text-text-primary">Nós cobramos pelo impacto que geramos no seu faturamento, não pelas horas que ficamos na frente do computador.</strong>
                            </p>
                            <a href="/contato" className="btn btn-primary btn-lg inline-flex shadow-xl shadow-primary/20">Agendar Diagnóstico Gratuito</a>
                        </div>
                        <div className="hidden md:flex flex-1 justify-center relative z-10">
                            <div className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center border border-border/50 animate-[float_6s_ease-in-out_infinite] w-full max-w-sm">
                                <div className="text-6xl mb-2">📈</div>
                                <span className="block text-6xl font-black text-transparent bg-clip-text bg-gradient-primary leading-tight mb-2">4.8x</span>
                                <span className="text-sm uppercase tracking-widest text-text-tertiary font-bold">Retorno Médio (ROAS)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Servicos;
