import React from 'react';
import LeadForm from '../components/LeadForm';
import { useNavigate, useLocation } from 'react-router-dom';

const Contato: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialInterest = location.state?.service;

    const handleSuccess = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-bg-primary text-text-primary">
            {/* HERO */}
            <section className="relative py-32 text-center bg-bg-secondary/30">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fadeInUp tracking-tight">
                        Entre em <span className="text-transparent bg-clip-text bg-gradient-primary">Contato</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-text-secondary leading-relaxed animate-fadeInUp">
                        Estamos prontos para impulsionar seu crescimento digital. Fale com nossa equipe!
                    </p>
                </div>
            </section>

            <section className="section py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-text-primary">Canais de Atendimento</h2>
                                <p className="text-lg text-text-secondary leading-relaxed">
                                    Escolha a forma mais conveniente para você. Nossa equipe geralmente responde em menos de 2 horas em horário comercial.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <a href="mailto:contato.lyradesign@gmail.com" className="group flex items-start p-6 bg-bg-tertiary rounded-2xl border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-2xl mr-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">Email</h4>
                                        <p className="text-text-secondary">contato.lyradesign@gmail.com</p>
                                    </div>
                                </a>

                                <a href="https://wa.me/5564999381522" target="_blank" rel="noopener noreferrer" className="group flex items-start p-6 bg-bg-tertiary rounded-2xl border border-border transition-all duration-300 hover:shadow-lg hover:border-success/30 hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-success text-2xl mr-6 group-hover:bg-success group-hover:text-black transition-colors duration-300">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-1 group-hover:text-success transition-colors">WhatsApp</h4>
                                        <p className="text-text-secondary">(64) 99232-7984</p>
                                    </div>
                                </a>

                                <div className="flex items-start p-6 bg-bg-tertiary rounded-2xl border border-border transition-all duration-300 hover:shadow-lg hover:border-border">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-text-secondary text-2xl mr-6">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-1">Localização</h4>
                                        <p className="text-text-secondary">Caldas Novas, GO - Brasil<br /><span className="text-sm text-text-tertiary">(Atendimento Global)</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Wrapper */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-3xl blur-2xl transform rotate-3 scale-105 pointer-events-none"></div>
                            <div className="relative bg-bg-tertiary rounded-3xl border border-border overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-border bg-bg-secondary/30">
                                    <h3 className="text-2xl font-bold text-center">Envie uma Mensagem</h3>
                                </div>
                                <div className="[&_.lead-form-section]:p-0 [&_.lead-form-section]:bg-transparent [&_.lead-form-section]:before:hidden [&_.form-container]:shadow-none [&_.form-container]:bg-transparent [&_.form-container]:border-0 [&_.form-header]:hidden">
                                    <LeadForm onSuccess={handleSuccess} compact={true} initialInterest={initialInterest} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contato;
