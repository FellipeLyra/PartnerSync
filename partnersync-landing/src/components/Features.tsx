import React from 'react';

const Features: React.FC = () => {
    const features = [
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Arte para Instagram',
            description: 'Design de alta conversão que para o scroll. Posts, stories e carrosséis alinhados com sua identidade visual.'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M15 10L19.553 7.724C20.1174 7.44193 20.7809 7.81608 20.7809 8.44737V15.5526C20.7809 16.1839 20.1174 16.5581 19.553 16.276L15 14M5 18H11C12.1046 18 13 17.1046 13 16V8C13 6.89543 12.1046 6 11 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Edição de Vídeo',
            description: 'Reels e TikToks dinâmicos editados para retenção máxima. Transforme visualizações em seguidores.'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M13 7H21M21 7V15M21 7L13 15L9 11L3 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Tráfego Pago',
            description: 'Chegue ao cliente certo. Campanhas de alta performance no Facebook e Google Ads focadas em ROI.'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.4607 21 9.01172 20.5819 7.77564 19.8477L3 21L4.15234 16.2244C3.41814 14.9883 3 13.5393 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Gestão de Redes',
            description: 'Estratégia completa: do planejamento à publicação. Tenha consistência sem perder tempo.'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M11 5H17M7 19H13M14 5L10 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Copywriting Persuasivo',
            description: 'Textos que vendem. Legendas, scripts e páginas de vendas com gatilhos mentais poderosos.'
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Business Intelligence',
            description: 'Não chutamos, analisamos. Relatórios detalhados para otimizar cada centavo do seu investimento.'
        }
    ];

    return (
        <section className="section bg-bg-secondary relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fadeInUp">
                    <h2 className="mb-6 text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-primary-dark">
                        Tudo que você precisa para <br />
                        <span className="text-primary">Dominar o Digital</span>
                    </h2>
                    <p className="max-w-[700px] mx-auto text-lg text-text-secondary leading-relaxed">
                        Esqueça a dor de cabeça de contratar freelancers aleatórios.
                        Tenha um time completo de especialistas focado no seu resultado.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl bg-white border border-border/50 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
