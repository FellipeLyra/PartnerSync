import React from 'react';

const Sobre: React.FC = () => {
    return (
        <div className="bg-bg-primary text-text-primary">
            {/* HERO */}
            <section className="relative py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-primary/5 blur-[100px] animate-pulse"></div>
                    <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[80px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 animate-fadeInUp tracking-tight">
                        Criamos o futuro <br />
                        <span className="text-transparent bg-clip-text bg-gradient-primary">do seu negócio.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-text-secondary leading-relaxed animate-fadeInUp">
                        Somos mais que uma agência. Somos o braço direito de crescimento para empresas que não aceitam o "médio".
                    </p>
                </div>
            </section>

            {/* MISSION */}
            <section className="section py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative animate-fadeInLeft">
                            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-bg-secondary relative border border-border">
                                {/* Placeholder for Team/Office Image */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <span className="text-6xl">🏢</span>
                                </div>
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-10 -right-10 bg-bg-tertiary p-6 rounded-2xl shadow-xl border border-border max-w-[200px] animate-[float_5s_ease-in-out_infinite]">
                                <div className="text-4xl font-bold text-primary mb-1">5+</div>
                                <div className="text-sm text-text-secondary font-medium uppercase tracking-wide">Anos de Mercado</div>
                            </div>
                        </div>

                        <div className="animate-fadeInRight">
                            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Nossa Essência</h2>
                            <h3 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-white">
                                Não acreditamos em sorte.<br />
                                Acreditamos em <span className="text-primary">Método.</span>
                            </h3>
                            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
                                <p>
                                    A Viral Studio nasceu de uma frustração simples: o mercado de marketing digital estava cheio de promessas vazias e profissionais que "achavam" demais e testavam de menos.
                                </p>
                                <p>
                                    Desenvolvemos uma metodologia proprietária baseada em dados, comportamento de consumo e tecnologia. Não jogamos para ver "se cola". Nós construímos máquinas de vendas previsíveis.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div>
                                    <h4 className="text-4xl font-black text-text-primary mb-2">150+</h4>
                                    <p className="text-sm text-text-secondary uppercase tracking-tight">Projetos Entregues</p>
                                </div>
                                <div>
                                    <h4 className="text-4xl font-black text-text-primary mb-2">R$ 12M+</h4>
                                    <p className="text-sm text-text-secondary uppercase tracking-tight">Gerados para Clientes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section py-32">
                <div className="container mx-auto px-6">
                    <div className="bg-bg-tertiary border border-border/10 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:200%_0,0_0] duration-[1500ms]"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Pronto para o próximo nível?</h2>
                            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
                                Se você sente que sua empresa tem potencial para vender muito mais, mas está travada no digital, nós somos o parceiro que você procurava.
                            </p>
                            <a href="/contato" className="inline-flex items-center gap-3 bg-accent text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-accent-dark hover:scale-105 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
                                Falar com um Especialista
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Sobre;
