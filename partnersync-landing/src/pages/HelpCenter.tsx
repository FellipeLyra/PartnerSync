import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
    const categories = [
        {
            title: 'Começando',
            description: 'Tudo o que você precisa saber para iniciar com nossos serviços.',
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            )
        },
        {
            title: 'Serviços e Planos',
            description: 'Detalhes sobre nossos pacotes de crescimento e consultoria.',
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
            )
        },
        {
            title: 'Conta e Faturamento',
            description: 'Gerencie seus pagamentos, faturas e dados cadastrais.',
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
            )
        },
        {
            title: 'Suporte Técnico',
            description: 'Resolva problemas técnicos e tire dúvidas sobre a plataforma.',
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
            )
        }
    ];

    return (
        <div className="pt-20 bg-[#0B0F1A] min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1F6BFF]/10 to-transparent pointer-events-none" />
                <div className="container mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#1F6BFF]/10 text-[#1F6BFF] text-sm font-semibold mb-6 animate-fadeIn">
                        Central de Ajuda
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fadeInUp">
                        Como podemos ajudar você hoje?
                    </h1>
                    <p className="text-[#9AA3C7] text-xl max-w-2xl mx-auto mb-10 animate-fadeInUp delay-100">
                        Encontre respostas para suas dúvidas, tutoriais e suporte especializado.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative animate-fadeInUp delay-200">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-[#5F678C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Busque por dúvidas, tópicos ou palavras-chave..."
                            className="w-full py-4 pl-14 pr-6 bg-[#131B2C] border border-white/[0.06] rounded-xl text-white placeholder-[#5F678C] focus:outline-none focus:border-[#1F6BFF] focus:ring-1 focus:ring-[#1F6BFF] transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-16 px-6">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="bg-[#131B2C]/50 backdrop-blur-sm border border-white/[0.06] p-8 rounded-2xl hover:border-[#1F6BFF]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="mb-6 p-3 bg-[#1F6BFF]/10 rounded-lg w-fit group-hover:bg-[#1F6BFF]/20 transition-colors">
                                    {category.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{category.title}</h3>
                                <p className="text-[#9AA3C7] text-sm leading-relaxed">
                                    {category.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Links / FAQ CTA */}
            <section className="py-16 px-6 bg-[#0E1422]">
                <div className="container mx-auto max-w-4xl">
                    <div className="glass p-10 rounded-3xl border border-white/[0.06] text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1F6BFF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 relative z-10">
                            Perguntas Frequentes
                        </h2>
                        <p className="text-[#9AA3C7] mb-8 max-w-xl mx-auto relative z-10">
                            Muitas dúvidas já foram respondidas em nossa seção de FAQ. Confira se a sua resposta já está lá.
                        </p>
                        <div className="flex justify-center gap-4 relative z-10">
                            <Link
                                to="/faq"
                                className="px-8 py-3 bg-[#131B2C] text-white rounded-xl hover:bg-[#1F6BFF] transition-all duration-300 font-medium border border-white/[0.1]"
                            >
                                Ver FAQ Completo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 px-6 text-center">
                <div className="container mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-4">Ainda precisa de ajuda?</h2>
                    <p className="text-[#9AA3C7] mb-8">Nossa equipe de suporte está pronta para te atender.</p>
                    <div className="flex justify-center gap-4">
                        <Link
                            to="/contato"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#1F6BFF] text-white rounded-xl hover:bg-[#1C60E6] transition-all duration-300 font-medium shadow-lg shadow-[#1F6BFF]/25"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Fale Conosco
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpCenter;
