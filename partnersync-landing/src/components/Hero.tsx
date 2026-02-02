import React from 'react';
import { Link } from 'react-router-dom';

interface HeroProps {
    onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-32 bg-bg-primary">
            {/* Background Effects */}
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[300px] md:h-[500px] bg-gradient-to-b from-primary/[0.02] to-transparent"></div>
                <div className="absolute -top-[10%] -right-[10%] w-[200px] h-[200px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-primary opacity-[0.03] md:opacity-[0.02] blur-[60px] md:blur-[100px] animate-pulse"></div>
                <div className="absolute top-[20%] -left-[10%] w-[250px] h-[250px] md:w-[600px] md:h-[600px] rounded-full bg-secondary/10 blur-[50px] md:blur-[80px] animate-[float_8s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-primary to-transparent z-10"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 w-full">
                <div className="max-w-[900px] mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8 animate-[fadeInUp_0.6s_ease-out_forwards]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                        </span>
                        <span className="text-sm font-semibold text-primary tracking-wide uppercase">Agência de Performance Digital</span>
                    </div>

                    <h1 className="text-text-primary mb-8 leading-[1.05] tracking-tight text-5xl md:text-7xl lg:text-8xl font-black animate-[fadeInUp_0.6s_ease-out_0.1s_forwards] opacity-0">
                        Escale sua marca com <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-primary relative">
                            Poder Digital
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary opacity-40 -z-10" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7501 2.49994 132.5 -3.50005 198 2.49996" stroke="currentColor" strokeWidth="3"></path></svg>
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl max-w-[700px] mx-auto text-text-secondary leading-relaxed mb-12 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards] opacity-0">
                        Transformamos seguidores em clientes através de estratégias validadas de tráfego, conteúdo e design. Pare de postar por postar, comece a <span className="font-semibold text-text-primary">vender</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards] opacity-0">
                        <button
                            className="group relative px-8 py-4 bg-gradient-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto overflow-hidden"
                            onClick={onGetStarted}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Quero Escalar Meu Negócio
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </span>
                        </button>
                        <Link
                            to="/cases"
                            className="px-8 py-4 text-primary font-semibold text-lg bg-transparent border-2 border-primary rounded-xl hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto flex justify-center"
                        >
                            Ver Cases de Sucesso
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-border/60 pt-12 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards] opacity-0">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-text-primary mb-1">+50Mi</span>
                            <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">Impressões Geradas</span>
                        </div>
                        <div className="flex flex-col items-center border-l-0 sm:border-l border-r-0 sm:border-r border-border/60">
                            <span className="text-3xl font-black text-text-primary mb-1">8x</span>
                            <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">Retorno Médio (ROAS)</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-text-primary mb-1">24h</span>
                            <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">Suporte Dedicado</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
