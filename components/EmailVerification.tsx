import React, { useState } from 'react';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const EmailVerification: React.FC = () => {
    const { currentUser, sendVerificationEmail, reloadUser, logout } = useAuth();
    const { addToast } = useToast();
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);

    const handleResend = async () => {
        setSending(true);
        try {
            await sendVerificationEmail();
            addToast('Email de verificação reenviado! Verifique sua caixa de entrada.', 'success');
        } catch (error: any) {
            // Firebase throws error if email sent too recently
            if (error.code === 'auth/too-many-requests') {
                addToast('Aguarde alguns instantes antes de tentar novamente.', 'warning');
            } else {
                addToast('Erro ao enviar email. Tente novamente mais tarde.', 'error');
            }
        } finally {
            setSending(false);
        }
    };

    const handleCheckVerification = async () => {
        setChecking(true);
        try {
            await reloadUser();
            // App.tsx handles the redirect if verified
            addToast('Status atualizado!', 'info');
        } catch (error) {
            addToast('Erro ao verificar status.', 'error');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 text-center animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center relative">
                        <Mail size={32} className="text-indigo-600 dark:text-indigo-400" />
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
                            <span className="w-3 h-3 block bg-amber-500 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifique seu Email</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Enviamos um link de verificação para:<br />
                    <span className="font-semibold text-slate-900 dark:text-white">{currentUser?.email}</span>
                </p>

                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 mb-6">
                        <p className="mb-2 font-medium">Não recebeu o email?</p>
                        <p>1. Verifique sua pasta de Spam/Lixo Eletrônico</p>
                        <p>2. Aguarde alguns minutos antes de reenviar</p>
                    </div>

                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="w-full bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-semibold py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                        {sending ? 'Enviando...' : 'Reenviar Email'}
                    </button>

                    <button
                        onClick={handleCheckVerification}
                        disabled={checking}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center"
                    >
                        {checking ? (
                            <RefreshCw className="animate-spin mr-2" size={20} />
                        ) : (
                            <CheckCircle className="mr-2" size={20} />
                        )}
                        {checking ? 'Verificando...' : 'Já verifiquei meu email'}
                    </button>

                    <button
                        onClick={logout}
                        className="w-full text-slate-500 dark:text-slate-400 text-sm hover:text-slate-700 dark:hover:text-slate-200 py-2 flex items-center justify-center transition-colors"
                    >
                        <LogOut size={16} className="mr-2" />
                        Sair e entrar com outra conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
