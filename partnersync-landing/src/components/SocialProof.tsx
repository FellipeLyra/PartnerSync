import React from 'react';

const SocialProof: React.FC = () => {
    const testimonials = [
        {
            name: 'João Vitor Carmo',
            role: 'Proprietário, Garagem JVC',
            avatar: <img src="/Avatar/João.png" alt="João Vitor Carmo" className="w-full h-full object-cover rounded-full" />,
            text: 'A equipe do Linkate são comprometidos, criativos e extremamente proativos. Foram responsáveis por todo o branding da Garagem JVC, e o resultado ficou simplesmente impecável! Seu trabalho como designer UX/UI superou todas as expectativas. Super indico a Linkate para qualquer pessoa que precise de profissionais talentosos e dedicados na área de design!'
        },
        {
            name: 'Ricardo Alves',
            role: 'Fundador, FitLife Academia',
            avatar: '💪',
            text: 'A equipe da Linkate entende de resultados. Nosso Instagram cresceu 250% e o ROI das campanhas superou todas as expectativas.'
        },
        {
            name: 'Juliana Costa',
            role: 'CEO, BeautyGlow Cosméticos',
            avatar: '💄',
            text: 'Profissionalismo e criatividade em cada entrega. Os vídeos que produzem geram engajamento real e conversões consistentes.'
        }
    ];

    const stats = [
        { value: '300%', label: 'Crescimento Médio' },
        { value: '4.8x', label: 'ROI Médio' },
        { value: '50+', label: 'Marcas Atendidas' },
        { value: '2M+', label: 'Alcance Gerado' }
    ];

    return (
        <section className="section bg-bg-secondary">
            <div className="container mx-auto px-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-24 animate-fadeInUp">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center p-8">
                            <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-none mb-2 text-gradient">{stat.value}</div>
                            <div className="text-base text-text-secondary font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Testimonials */}
                <div className="text-center mb-16 animate-fadeInUp">
                    <h2 className="mb-4 text-3xl md:text-5xl font-bold">Resultados Que Falam Por Si</h2>
                    <p className="max-w-[600px] mx-auto text-lg text-text-secondary">Marcas que confiaram na Viral Studio e alcançaram crescimento exponencial</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="p-8 md:p-12 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-bg-tertiary border border-border/50 animate-fadeInUp"
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <div className="text-primary opacity-30 mb-6">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 9V5C10 3.89543 9.10457 3 8 3H5C3.89543 3 3 3.89543 3 5V9C3 11.2091 4.79086 13 7 13H8M10 9C10 11.2091 8.20914 13 6 13H5M10 9H8M21 9V5C21 3.89543 20.1046 3 19 3H16C14.8954 3 14 3.89543 14 5V9C14 11.2091 15.7909 13 18 13H19M21 9C21 11.2091 19.2091 13 17 13H16M21 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-lg italic text-text-primary leading-relaxed mb-8">"{testimonial.text}"</p>
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xl flex-shrink-0">{testimonial.avatar}</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-text-primary mb-0.5">{testimonial.name}</div>
                                    <div className="text-sm text-text-secondary">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
