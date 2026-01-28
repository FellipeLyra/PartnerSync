import React, { useState } from 'react';
import { User } from '../types';
import { auth, googleProvider } from '../firebaseConfig';
import * as firebaseAuth from 'firebase/auth';
import { storageService } from '../services/storageService';
import { Users, ArrowRight, Mail, Lock, User as UserIcon, Chrome, AlertTriangle, Copy } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to sync Firebase Auth user to our DB User
  const handleAuthSuccess = async (firebaseUser: any, customUsername?: string) => {
    try {
        // 1. Check if user already exists in Firestore to preserve their Avatar/Data
        const existingUser = await storageService.getUser(firebaseUser.uid);

        if (existingUser) {
            // User exists: Use the data from database (preserves custom avatar)
            console.log("User found in DB, using existing data.");
            onLogin(existingUser);
        } else {
            // New User: Create in database
            const newUser: User = {
                id: firebaseUser.uid,
                username: customUsername || firebaseUser.displayName || firebaseUser.email.split('@')[0],
                avatar: firebaseUser.photoURL || '',
            };
            console.log("New user, saving to DB.");
            await storageService.saveUser(newUser);
            onLogin(newUser);
        }
    } catch (err) {
        console.error("Error in handleAuthSuccess:", err);
        // Fallback: allow login even if DB fetch fails (e.g. permission issues), but don't overwrite DB
        const fallbackUser: User = {
            id: firebaseUser.uid,
            username: customUsername || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            avatar: firebaseUser.photoURL || '',
        };
        onLogin(fallbackUser);
    }
  };

  const getErrorMessage = (err: any) => {
      console.error("Auth Error Detail:", err);
      if (err.code === 'auth/wrong-password') return "Senha incorreta.";
      if (err.code === 'auth/user-not-found') return "Usuário não encontrado.";
      if (err.code === 'auth/email-already-in-use') return "Email já cadastrado.";
      if (err.code === 'auth/weak-password') return "Senha muito fraca (mínimo 6 caracteres).";
      if (err.code === 'auth/popup-closed-by-user') return "Login cancelado.";
      if (err.code === 'auth/popup-blocked') return "Pop-up bloqueado. Permita pop-ups para este site.";
      
      if (err.code === 'auth/unauthorized-domain') {
          const currentDomain = window.location.hostname;
          return `DOMÍNIO BLOQUEADO: O endereço "${currentDomain}" não está autorizado.`;
      }

      if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
          return "ERRO DE PERMISSÃO: Banco de dados bloqueado (Firestore Rules).";
      }
      
      return "Erro: " + (err.message || "Tente novamente.");
  };

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
        setError("Firebase não configurado corretamente. Verifique firebaseConfig.ts");
        return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        setError("Firebase não configurado corretamente.");
        return;
    }
    
    if (!email || !password) {
        setError("Preencha todos os campos.");
        return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!username) {
            setError("Nome de usuário é obrigatório.");
            setLoading(false);
            return;
        }
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
        await firebaseAuth.updateProfile(userCredential.user, { displayName: username });
        await handleAuthSuccess(userCredential.user, username);
      } else {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Users size={32} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-2">PartnerSync</h1>
        <p className="text-center text-slate-400 mb-8">
            {isRegistering ? 'Crie sua conta para começar' : 'Entre para acessar seus projetos'}
        </p>

        {/* Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-lg mb-6">
            <button 
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isRegistering ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Entrar
            </button>
            <button 
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isRegistering ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Cadastrar
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Nome de Usuário"
                required={isRegistering}
                />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Email"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Senha"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg animate-fade-in flex flex-col space-y-2">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-red-400 text-sm font-medium text-left break-all">{error}</span>
                </div>
                {error.includes('DOMÍNIO BLOQUEADO') && (
                    <div className="ml-7 mt-2">
                        <p className="text-xs text-slate-400 mb-2">
                            Copie o endereço acima e adicione em:<br/>
                            <span className="font-mono bg-slate-900 px-1 rounded">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains</span>
                        </p>
                    </div>
                )}
                {error.includes('ERRO DE PERMISSÃO') && (
                    <div className="ml-7 mt-2">
                        <p className="text-xs text-slate-400 mb-2">
                            Vá no <strong>Firebase Console &gt; Firestore Database &gt; Rules</strong> e altere para:
                        </p>
                        <pre className="bg-slate-900 p-2 rounded text-[10px] text-slate-300 overflow-x-auto select-all">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                        </pre>
                    </div>
                )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-all transform hover:scale-[1.02] flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span className="animate-pulse">Processando...</span>
            ) : (
                <>
                    <span>{isRegistering ? 'Criar Conta' : 'Acessar Sistema'}</span>
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18}/>
                </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OU</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <Chrome className="mr-2 text-red-500" size={18} />
            Entrar com Google
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-slate-500">
           Sistema online sincronizado via Firebase.
           <br/>Certifique-se que o <code>firebaseConfig.ts</code> está configurado.
        </p>
      </div>
    </div>
  );
};

export default Auth;