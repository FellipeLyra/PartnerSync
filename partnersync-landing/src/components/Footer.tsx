import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#070B17] text-[#9AA3C7] pt-24 pb-8 border-t border-white/[0.06]">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-24 mb-16 pb-16 border-b border-white/[0.06]">
                    <div className="footer-brand">
                        <h3 className="text-2xl mb-4 text-white font-bold">Linkate</h3>
                        <p className="text-[#9AA3C7] mb-6 max-w-[300px]">Sua parceira estratégica para crescimento digital sustentável.</p>
                        <div className="flex gap-4">
                            {/*<a href="https://instagram.com/linkate" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center text-[#7C84A6] transition-all duration-300 hover:text-[#1F6BFF] hover:bg-white/[0.08] hover:-translate-y-0.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>*/}
                            <a href="mailto:linkatecompany@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Mail" className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center text-[#7C84A6] transition-all duration-300 hover:text-[#1F6BFF] hover:bg-white/[0.08] hover:-translate-y-0.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </a>
                            <a href="https://wa.me/5564999381522" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center text-[#7C84A6] transition-all duration-300 hover:text-[#1F6BFF] hover:bg-white/[0.08] hover:-translate-y-0.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 space-between">

                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Empresa</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/sobre" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Sobre Nós</Link></li>
                                <li className="mb-2"><Link to="/portfolio" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Portfólio</Link></li>
                                <li className="mb-2"><Link to="/cases" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Cases de Sucesso</Link></li>
                                <li className="mb-2"><Link to="/" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Blog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Suporte</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/faq" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Central de Ajuda</Link></li>
                                <li className="mb-2"><Link to="/contato" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Contato</Link></li>
                                <li className="mb-2"><Link to="/faq" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">FAQ</Link></li>

                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-6 text-white">Legal</h4>
                            <ul className="list-none">
                                <li className="mb-2"><Link to="/privacidade" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Privacidade</Link></li>
                                <li className="mb-2"><Link to="/termos" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Termos de Uso</Link></li>
                                <li className="mb-2"><Link to="/cookies" className="text-[#9AA3C7] no-underline text-sm transition-colors duration-300 hover:text-[#1F6BFF]">Cookies</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 text-center md:text-left">
                    <p className="text-[#5F678C] text-sm">&copy; 2026 Linkate. Todos os direitos reservados.</p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <span className="flex items-center gap-2 text-sm text-[#5F678C]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            SSL Seguro
                        </span>
                        <span className="flex items-center gap-2 text-sm text-[#5F678C]">
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
