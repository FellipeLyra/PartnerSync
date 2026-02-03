import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-secondary/90 backdrop-blur-md shadow-lg shadow-black/20 py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex-1 flex justify-start">
                    <Link to="/" className="flex items-center gap-2 group z-50 relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                            <img
                                src="/logo.linkate.png"
                                alt="Linkatech Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-primary-dark tracking-tight">
                            Linkate
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Menu */}
                <div className="hidden lg:flex items-center gap-10 bg-white/5 backdrop-blur-sm px-8 py-3 rounded-full border border-white/10 shadow-sm">
                    {['Serviços', 'Portfólio', 'Cases', 'Sobre'].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                            className="text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-300 relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                        </Link>
                    ))}
                </div>

                {/* Right: CTA & Mobile Toggle */}
                <div className="flex-1 flex justify-end items-center gap-4">
                    <Link to="/contato" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5">
                        <span>Começar Agora</span>
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden relative z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <span className={`w-6 h-0.5 bg-text-primary rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-6 h-0.5 bg-text-primary rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-6 h-0.5 bg-text-primary rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-bg-primary/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                {['Serviços', 'Portfólio', 'Cases', 'Sobre'].map((item, idx) => (
                    <Link
                        key={item}
                        to={`/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                        className={`text-2xl font-bold text-text-primary transition-all duration-500 hover:text-primary ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                        style={{ transitionDelay: `${idx * 0.1}s` }}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {item}
                    </Link>
                ))}
                <Link
                    to="/contato"
                    className={`px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/30 ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                    style={{ transitionDelay: '0.4s' }}
                    onClick={() => setMobileMenuOpen(false)}
                >
                    Falar com Especialista
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
