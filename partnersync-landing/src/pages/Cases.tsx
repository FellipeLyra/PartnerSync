import React from 'react';
import SocialProof from '../components/SocialProof';

const Cases: React.FC = () => {
    return (
        <div className="pt-20 bg-bg-primary">
            <section className="bg-bg-secondary py-24 text-center text-text-primary border-b border-border">
                <div className="container mx-auto px-6">
                    <h1 className="animate-fadeInUp text-4xl md:text-5xl font-bold mb-6">Cases de Sucesso</h1>
                    <p className="max-w-[700px] mx-auto text-xl text-text-secondary animate-fadeInUp">
                        Histórias reais de crescimento e transformação digital
                    </p>
                </div>
            </section>

            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="mb-24">
                        <SocialProof />
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-text-primary">Metodologia Comprovada</h2>
                        <p className="max-w-[800px] mx-auto mb-24 text-text-secondary text-lg leading-relaxed">
                            Nossos cases de sucesso não são coincidência. Seguimos uma metodologia testada e aprovada
                            que combina análise de dados, criatividade e otimização contínua.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="p-8 rounded-2xl text-center transition-all duration-300 bg-bg-tertiary border border-border shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 glass">
                                <div className="w-[50px] h-[50px] rounded-full bg-bg-secondary text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 border border-border">1</div>
                                <h3 className="mb-2 text-text-primary font-bold text-xl">Diagnóstico</h3>
                                <p className="text-text-secondary leading-relaxed">Análise profunda do seu negócio e concorrência</p>
                            </div>

                            <div className="p-8 rounded-2xl text-center transition-all duration-300 bg-bg-tertiary border border-border shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 glass">
                                <div className="w-[50px] h-[50px] rounded-full bg-bg-secondary text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 border border-border">2</div>
                                <h3 className="mb-2 text-text-primary font-bold text-xl">Estratégia</h3>
                                <p className="text-text-secondary leading-relaxed">Planejamento personalizado baseado em dados</p>
                            </div>

                            <div className="p-8 rounded-2xl text-center transition-all duration-300 bg-bg-tertiary border border-border shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 glass">
                                <div className="w-[50px] h-[50px] rounded-full bg-bg-secondary text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 border border-border">3</div>
                                <h3 className="mb-2 text-text-primary font-bold text-xl">Execução</h3>
                                <p className="text-text-secondary leading-relaxed">Implementação com foco em qualidade e prazos</p>
                            </div>

                            <div className="p-8 rounded-2xl text-center transition-all duration-300 bg-bg-tertiary border border-border shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 glass">
                                <div className="w-[50px] h-[50px] rounded-full bg-bg-secondary text-primary flex items-center justify-center text-xl font-bold mx-auto mb-6 border border-border">4</div>
                                <h3 className="mb-2 text-text-primary font-bold text-xl">Otimização</h3>
                                <p className="text-text-secondary leading-relaxed">Análise contínua e ajustes para maximizar resultados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section py-24">
                <div className="container mx-auto px-6">
                    <div className="glass bg-bg-tertiary/30 backdrop-blur-md rounded-2xl p-16 text-center border border-white/10">
                        <h2 className="text-3xl font-bold mb-4">Seja Nosso Próximo Case de Sucesso</h2>
                        <p className="text-lg text-text-secondary mb-8">Agende uma consulta gratuita e descubra como podemos ajudar</p>
                        <a href="/contato" className="btn btn-primary btn-lg inline-flex">Quero Crescer Agora</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Cases;
