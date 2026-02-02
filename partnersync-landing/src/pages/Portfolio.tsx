import React from 'react';

const Portfolio: React.FC = () => {
    const portfolioItems = [
        {
            title: 'Estética Automotiva',
            category: 'ARTES + Tráfego',
            results: '+45 agendamentos/mês',
            images: [
                '/estética-automotiva/Feed-natal.png',
                '/estética-automotiva/Película-feed-nexfil.png',
                '/estética-automotiva/insulfime-feed.png'
            ]
        },
        {
            title: 'Academia Fitness',
            category: 'Gestão de Redes + Vídeo',
            results: '+250% de seguidores',
            images: ['💪']
        },
        {
            title: 'Clínica de Estética',
            category: 'Tráfego Pago + Arte',
            results: 'ROI de 5.2x',
            images: ['💆']
        },
        {
            title: 'Restaurante Gourmet',
            category: 'Instagram + Copywriting',
            results: '+180% em reservas',
            images: ['🍽️']
        },
        {
            title: 'Loja de Cosméticos',
            category: 'Pacote Completo',
            results: '+400% de faturamento',
            images: ['💄']
        },
        {
            title: 'Consultoria Empresarial',
            category: 'LinkedIn + Tráfego',
            results: '+90 leads qualificados/mês',
            images: ['💼']
        }
    ];

    const videoItems = [
        {
            title: 'Comercial de TV - TechStart',
            category: 'Produção Publicitária',
            videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4', // Exemplo
            subtitle: 'Direção de Arte + Edição'
        },
        {
            title: 'Reels Viral - Moda',
            category: 'Conteúdo Vertical',
            videoUrl: '', // Sem vídeo (placeholder)
            subtitle: 'Roteiro + Captação + Edição'
        }
    ];

    return (
        <div className="pt-20 bg-bg-primary">
            <section className="bg-bg-secondary py-24 text-center text-text-primary border-b border-border">
                <div className="container mx-auto px-6">
                    <h1 className="animate-fadeInUp text-4xl md:text-5xl font-bold mb-6">Nosso Portfólio</h1>
                    <p className="max-w-[700px] mx-auto text-xl text-text-secondary animate-fadeInUp">
                        Conheça alguns dos projetos que transformaram negócios através do marketing digital
                    </p>
                </div>
            </section>

            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8">
                        {portfolioItems.map((item, index) => (
                            <div
                                key={index}
                                className="group relative perspective-1000 animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="relative w-full transition-all duration-300 hover:-translate-y-2">

                                    {/* Fan Effect Cards - Only behind the image section */}
                                    <div className="absolute top-0 left-0 w-full h-[180px] flex justify-center items-center z-0">
                                        {/* Left Card */}
                                        <div className="absolute top-0 w-full h-full transform transition-all duration-500 ease-out origin-bottom-left group-hover:-rotate-12 group-hover:-translate-x-24 group-hover:scale-75 opacity-0 group-hover:opacity-100 overflow-visible">
                                            {item.images[1] && item.images[1].includes('/') && (
                                                <img src={item.images[1]} alt="" className="w-full h-full object-cover group-hover:object-contain opacity-90 drop-shadow-xl" />
                                            )}
                                        </div>
                                        {/* Right Card */}
                                        <div className="absolute top-0 w-full h-full transform transition-all duration-500 ease-out origin-bottom-right group-hover:rotate-12 group-hover:translate-x-24 group-hover:scale-75 opacity-0 group-hover:opacity-100 overflow-visible">
                                            {item.images[2] && item.images[2].includes('/') && (
                                                <img src={item.images[2]} alt="" className="w-full h-full object-cover group-hover:object-contain opacity-90 drop-shadow-xl" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Card */}
                                    <div className="relative z-10 rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-300">
                                        <div className="h-[180px] flex items-center justify-center text-7xl overflow-hidden relative rounded-t-2xl z-20 transition-transform duration-500 group-hover:scale-75 group-hover:rounded-xl origin-bottom">
                                            {item.images[0].includes('/') ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                                                    <span className="group-hover:scale-110 transition-transform duration-300">{item.images[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8 text-left bg-white rounded-b-2xl border border-t-0 border-border group-hover:border-primary/30 transition-colors duration-300 relative z-30">
                                            <h3 className="mb-2 text-text-primary font-bold text-xl">{item.title}</h3>
                                            <p className="text-primary font-semibold mb-4 text-sm uppercase tracking-wide">{item.category}</p>
                                            <p className="text-text-secondary font-semibold text-lg mt-4 pt-4 border-t border-border block">{item.results}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section py-24 bg-bg-secondary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="mb-16 text-center">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Motion & Vídeo</span>
                        <h2 className="text-3xl md:text-4xl font-bold">Produções Audiovisuais</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {videoItems.map((item, index) => (
                            <div key={index} className="group rounded-2xl overflow-hidden bg-white shadow-lg border border-border/50 hover:shadow-2xl hover:border-primary/20 transition-all duration-300">
                                <div className="aspect-video bg-black relative overflow-hidden">
                                    {item.videoUrl ? (
                                        <video
                                            controls
                                            className="w-full h-full object-cover"
                                            preload="metadata"
                                        >
                                            <source src={item.videoUrl} type="video/mp4" />
                                            Seu navegador não suporta a tag de vídeo.
                                        </video>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white/40 group-hover:text-white/60 transition-colors">
                                            <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                            <p className="font-medium">Vídeo em Breve</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-2 text-text-primary">{item.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-primary font-bold text-sm uppercase tracking-wide">{item.category}</p>
                                        <span className="text-xs text-text-tertiary px-3 py-1 rounded-full bg-bg-secondary">{item.subtitle}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="glass rounded-2xl p-16 text-center border border-white/20">
                        <h2 className="text-3xl font-bold mb-4">Quer Resultados Assim?</h2>
                        <p className="text-lg text-text-secondary mb-8">Vamos criar uma estratégia personalizada para o seu negócio</p>
                        <a href="/contato" className="btn btn-primary btn-lg inline-flex">Solicitar Proposta</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Portfolio;
