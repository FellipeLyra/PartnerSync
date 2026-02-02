import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-text-primary text-white pt-24 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-24 mb-16 pb-16 border-b border-white/10">
                    <div className="footer-brand">
                        <h3 className="text-2xl mb-4 text-gradient">Viral Studio</h3>
                        <p className="text-white/70 mb-6 max-w-[300px]">Sua parceira estratégica para crescimento digital sustentável.</p>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/viralstudio" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-primary hover:-translate-y-0.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.5 8.5C16.5 8.22386 16.7239 8 17 8C17.2761 8 17.5 8.22386 17.5 8.5C17.5 8.77614 17.2761 9 17 9C16.7239 9 16.5 8.77614 16.5 8.5ZM12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8ZM12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" />
                                </svg>
                            </a>
                            <a href="https://linkedin.com/company/viralstudio" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-primary hover:-translate-y-0.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM18.5 18.5V13.2C18.5 12.3354 18.1565 11.5062 17.5452 10.8948C16.9338 10.2835 16.1046 9.94 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17C14.6813 12.17 15.0374 12.3175 15.2999 12.5801C15.5625 12.8426 15.71 13.1987 15.71 13.57V18.5H18.5ZM6.88 8.56C7.32556 8.56 7.75288 8.383 8.06794 8.06794C8.383 7.75288 8.56 7.32556 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19C6.43178 5.19 6.00193 5.36805 5.68499 5.68499C5.36805 6.00193 5.19 6.43178 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56ZM8.27 18.5V10.13H5.5V18.5H8.27Z" />
                                </svg>
                            </a>
                            <a href="https://facebook.com/viralstudio" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-primary hover:-translate-y-0.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28004 9.09 5.11004 7.38 3.00004 4.79C2.63004 5.42 2.42004 6.16 2.42004 6.94C2.42004 8.43 3.17004 9.75 4.33004 10.5C3.62004 10.5 2.96004 10.3 2.38004 10C2.38004 10 2.38004 10 2.38004 10.03C2.38004 12.11 3.86004 13.85 5.82004 14.24C5.46004 14.34 5.08004 14.39 4.69004 14.39C4.42004 14.39 4.15004 14.36 3.89004 14.31C4.43004 16 6.00004 17.26 7.89004 17.29C6.43004 18.45 4.58004 19.13 2.56004 19.13C2.22004 19.13 1.88004 19.11 1.54004 19.07C3.44004 20.29 5.70004 21 8.12004 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Serviços</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/servicos" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Arte para Instagram</Link></li>
                                <li className="mb-2"><Link to="/servicos" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Edição de Vídeo</Link></li>
                                <li className="mb-2"><Link to="/servicos" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Tráfego Pago</Link></li>
                                <li className="mb-2"><Link to="/servicos" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Gestão de Redes</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Empresa</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/sobre" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Sobre Nós</Link></li>
                                <li className="mb-2"><Link to="/portfolio" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Portfólio</Link></li>
                                <li className="mb-2"><Link to="/cases" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Cases de Sucesso</Link></li>
                                <li className="mb-2"><Link to="/" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Blog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Suporte</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/faq" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Central de Ajuda</Link></li>
                                <li className="mb-2"><Link to="/contato" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Contato</Link></li>
                                <li className="mb-2"><Link to="/faq" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">FAQ</Link></li>
                                <li className="mb-2"><a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">WhatsApp</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Legal</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/privacidade" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Privacidade</Link></li>
                                <li className="mb-2"><Link to="/termos" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Termos de Uso</Link></li>
                                <li className="mb-2"><Link to="/cookies" className="text-white/70 no-underline text-sm transition-colors duration-300 hover:text-white">Cookies</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 text-center md:text-left">
                    <p className="text-white/60 text-sm">&copy; 2026 Viral Studio. Todos os direitos reservados.</p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <span className="flex items-center gap-2 text-sm text-white/70">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            SSL Seguro
                        </span>
                        <span className="flex items-center gap-2 text-sm text-white/70">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            LGPD Compliant
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
