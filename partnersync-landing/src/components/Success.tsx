import React from 'react';

interface SuccessProps {
    onBackToHome: () => void;
}

const Success: React.FC<SuccessProps> = ({ onBackToHome }) => {
    return (
        <div className="min-h-screen flex items-center justify-center py-16 bg-bg-secondary">
            <div className="container mx-auto px-6">
                <div className="max-w-[600px] mx-auto p-12 rounded-2xl text-center shadow-xl bg-bg-tertiary border border-border/50 animate-fadeInUp">
                    <div className="w-[120px] h-[120px] mx-auto mb-8 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center animate-[scaleIn_0.5s_ease-out]">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h1 className="mb-6 text-text-primary text-3xl font-bold">Obrigado pelo Interesse!</h1>
                    <p className="text-lg text-text-secondary mb-12 leading-relaxed">
                        Recebemos suas informações com sucesso. Nossa equipe entrará em contato
                        em até 24 horas para apresentar o PartnerSync e responder todas as suas dúvidas.
                    </p>

                    <div className="bg-bg-secondary p-8 rounded-xl mb-12 text-left">
                        <h3 className="text-lg mb-6 text-text-primary font-semibold">Próximos Passos:</h3>
                        <ul className="list-none">
                            <li className="flex items-center gap-4 mb-4 text-text-secondary text-base last:mb-0">
                                <svg className="text-success flex-shrink-0 w-5 h-5" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Verificaremos seu email em breve
                            </li>
                            <li className="flex items-center gap-4 mb-4 text-text-secondary text-base last:mb-0">
                                <svg className="text-success flex-shrink-0 w-5 h-5" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Agende uma demonstração personalizada
                            </li>
                            <li className="flex items-center gap-4 mb-4 text-text-secondary text-base last:mb-0">
                                <svg className="text-success flex-shrink-0 w-5 h-5" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Comece a usar gratuitamente
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-6 justify-center flex-wrap flex-col sm:flex-row">
                        <button className="btn btn-primary w-full sm:w-auto" onClick={onBackToHome}>
                            Voltar para Home
                        </button>
                        <a href="https://wa.me/5511999999999" className="btn btn-secondary w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382C17.267 14.279 16.256 13.789 16.073 13.717C15.89 13.646 15.756 13.611 15.622 13.816C15.488 14.021 15.107 14.48 14.99 14.614C14.873 14.748 14.756 14.765 14.551 14.662C14.346 14.559 13.679 14.341 12.892 13.644C12.279 13.102 11.867 12.432 11.75 12.227C11.633 12.022 11.737 11.912 11.84 11.809C11.933 11.716 12.045 11.565 12.148 11.448C12.251 11.331 12.286 11.248 12.357 11.114C12.428 10.98 12.393 10.863 12.341 10.76C12.29 10.657 11.879 9.646 11.713 9.236C11.551 8.837 11.386 8.894 11.264 8.888C11.148 8.882 11.014 8.881 10.88 8.881C10.746 8.881 10.524 8.932 10.341 9.137C10.158 9.342 9.632 9.832 9.632 10.843C9.632 11.854 10.358 12.831 10.461 12.965C10.564 13.099 11.867 15.163 13.9 16.043C14.429 16.272 14.843 16.408 15.165 16.512C15.694 16.677 16.174 16.654 16.553 16.601C16.974 16.542 17.789 16.111 17.955 15.635C18.121 15.159 18.121 14.748 18.069 14.662C18.017 14.576 17.883 14.524 17.678 14.421M12.001 2C6.477 2 2 6.477 2 12C2 13.89 2.525 15.66 3.438 17.168L2.546 20.2C2.49478 20.3741 2.49141 20.5593 2.53624 20.7354C2.58107 20.9115 2.67245 21.0717 2.80076 21.1992C2.92907 21.3268 3.08991 21.4169 3.26636 21.4602C3.44281 21.5036 3.62793 21.4986 3.802 21.446L6.832 20.554C8.34 21.475 10.11 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" />
                            </svg>
                            Falar no WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Success;
