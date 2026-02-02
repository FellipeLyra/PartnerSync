/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary)',
                    dark: 'var(--primary-dark)',
                    light: 'var(--primary-light)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    dark: 'var(--secondary-dark)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    dark: 'var(--accent-dark)',
                },
                success: 'var(--success)',
                warning: 'var(--warning)',
                error: 'var(--error)',
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    tertiary: 'var(--text-tertiary)',
                    'on-dark': 'var(--text-on-dark)',
                },
                border: {
                    DEFAULT: 'var(--border)',
                    focus: 'var(--border-focus)',
                }
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
                display: ['var(--font-display)', 'sans-serif'],
            },
            boxShadow: {
                'glow': 'var(--shadow-glow)',
            },
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-secondary': 'var(--gradient-secondary)',
                'gradient-accent': 'var(--gradient-accent)',
                'gradient-hero': 'var(--gradient-hero)',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
            },
            animation: {
                fadeInUp: 'fadeInUp 0.6s ease-out forwards',
                fadeIn: 'fadeIn 0.6s ease-out forwards',
                slideInLeft: 'slideInLeft 0.6s ease-out forwards',
                scaleIn: 'scaleIn 0.5s ease-out forwards',
                slideUp: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }
        },
    },
    plugins: [],
}
