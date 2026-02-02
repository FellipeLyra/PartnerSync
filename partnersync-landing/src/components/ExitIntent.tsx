import React, { useState, useEffect } from 'react';
import { LeadService } from '../services/leadService';
import { type LeadFormData } from '../types';

interface ExitIntentProps {
    onClose?: () => void;
}

const ExitIntent: React.FC<ExitIntentProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShown) {
                // Check if user has already interacting with form to avoid annoying them
                // For now, simpler logic: just show
                setIsVisible(true);
                setHasShown(true);
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('mouseleave', handleMouseLeave);
        }, 5000); // Only activate after 5 seconds to avoid immediate popups

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timer);
        };
    }, [hasShown]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
        // Save to local storage to not show again for this session?
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            const leadData: LeadFormData = {
                name: 'Visitante (Exit Intent)',
                email: email,
                phone: '',
                organizationName: '',
                role: '',
                interest: 'Análise Gratuita (Exit Popup)',
                message: 'Lead capturado via popup de saída'
            };

            await LeadService.submitLead(leadData);
            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]" onClick={handleClose}>
            <div className="bg-white rounded-2xl max-w-[540px] w-full relative animate-[slideUp_0.4s_cubic-bezier(0.4,0,0.2,1)] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-4 right-4 bg-black/5 border-none w-8 h-8 rounded-full text-xl cursor-pointer flex items-center justify-center transition-all duration-300 text-text-secondary hover:bg-black/10 hover:rotate-90 z-10" onClick={handleClose} aria-label="Fechar">
                    ✕
                </button>

                {success ? (
                    <div className="p-12 text-center animate-fadeIn">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                            🎉
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">Sucesso!</h2>
                        <p className="text-text-secondary">Sua análise será enviada para o seu email em breve.</p>
                    </div>
                ) : (
                    <div className="p-8 sm:p-12 text-center">
                        <div className="text-5xl mb-6 animate-pulse">⚡</div>
                        <h2 className="mb-2 text-text-primary text-2xl sm:text-3xl font-bold">Espere! Não Vá Embora Ainda...</h2>
                        <p className="text-lg text-text-secondary mb-8">
                            Receba uma <strong className="text-primary font-bold">Análise Gratuita</strong> da sua presença digital
                        </p>

                        <div className="flex flex-col gap-3 mb-8 text-left max-w-sm mx-auto">
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-xs">✓</div>
                                <span>Auditoria completa do seu Instagram</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-xs">✓</div>
                                <span>Identificação de oportunidades</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 text-xs">✓</div>
                                <span>Proposta em 24 horas</span>
                            </div>
                        </div>

                        <form className="flex flex-col gap-4 mb-4" onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Seu melhor e-mail"
                                required
                                className="p-4 border border-border bg-bg-secondary/30 rounded-xl text-base outline-none transition-all duration-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn bg-primary text-white hover:bg-primary-dark w-full shadow-lg shadow-primary/20 py-4 text-lg font-bold"
                            >
                                {loading ? 'Enviando...' : 'Quero Minha Análise Gratuita'}
                            </button>
                        </form>

                        <p className="text-xs text-text-tertiary m-0">
                            🔒 Seus dados estão seguros. Sem spam, prometemos!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExitIntent;
