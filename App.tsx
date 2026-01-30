import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import TimeTracker from './components/TimeTracker';
import Kanban from './components/Kanban';
import Chat from './components/Chat';
import { User, ViewState, Company } from './types';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { auth } from './firebaseConfig';
import * as firebaseAuth from 'firebase/auth';
import { AlertTriangle, Copy, Check, Clock, KanbanSquare, MessageSquare, LogOut, UserPlus, X } from 'lucide-react';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import TeamManagement from './components/TeamManagement';
import CRMLayout from './components/crm/CRMLayout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('TIME_CLOCK');
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen for Firebase Auth changes
    if (auth) {
      const unsubscribe = firebaseAuth.onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // First, check if we have data in Firestore (where the custom avatar is saved)
            const userData = await storageService.getUser(user.uid);

            if (userData) {
              // Use Firestore data (has persisted avatar)
              setCurrentUser(userData);
            }
          } catch (error: any) {
            console.error("Erro ao buscar dados do usuário:", error);

            if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
              setConfigError(true);
              setCurrentUser(null); // Ensure we don't proceed with partial state
            } else {
              // Non-permission error, try to limp along with basic auth data
              setCurrentUser({
                id: user.uid,
                username: user.displayName || user.email?.split('@')[0] || 'User',
                avatar: user.photoURL || ''
              });
            }
          }
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to chat messages to count unread and play sound
  useEffect(() => {
    if (!currentUser?.companyId) return;

    // Get last read timestamp from localStorage
    const getLastReadTime = () => {
      const stored = localStorage.getItem(`chat-last-read-${currentUser.companyId}`);
      return stored ? parseInt(stored) : Date.now();
    };

    let lastReadTime = getLastReadTime();
    let previousMessageCount = 0;

    const unsubscribe = storageService.subscribeChat(
      currentUser.companyId,
      'global',
      (messages) => {
        if (currentView === 'CHAT') {
          // User is viewing chat - mark all as read
          lastReadTime = Date.now();
          localStorage.setItem(`chat-last-read-${currentUser.companyId}`, lastReadTime.toString());
          setUnreadCount(0);
        } else {
          // Count messages from others received after last read time
          const unread = messages.filter(
            (msg) =>
              msg.userId !== currentUser.id &&
              msg.isAi !== true &&
              msg.timestamp > lastReadTime
          ).length;
          setUnreadCount(unread);
        }

        // Play sound for new messages from others (regardless of view)
        if (previousMessageCount > 0 && messages.length > previousMessageCount) {
          const newMessages = messages.slice(previousMessageCount);

          newMessages.forEach(msg => {
            // Only play sound for messages from other users (not me, not AI)
            if (msg.userId !== currentUser.id && msg.isAi !== true) {
              notificationService.playSound();
            }
          });
        }

        previousMessageCount = messages.length;
      }
    );

    return () => unsubscribe();
  }, [currentUser, currentView]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('TIME_CLOCK');
  };

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    setCurrentUser(null);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    // Save to DB
    try {
      await storageService.updateUser(updatedUser);
      // Update Local State immediately
      setCurrentUser(updatedUser);
    } catch (e: any) {
      console.error("Erro ao atualizar usuário:", e);
      if (e.code === 'permission-denied') {
        alert("Erro de Permissão: Não foi possível salvar as alterações. Verifique as regras do Firebase.");
      } else {
        // Even if 'No document to update' happens (unlikely now), alert user gently
        alert("Erro ao salvar dados. Tente recarregar a página.");
      }
    }
  };

  const copyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (configError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-red-500/50 animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Acesso Negado (Permissões)</h2>
          </div>

          <p className="text-slate-300 mb-6 leading-relaxed text-sm">
            O app não consegue acessar o banco de dados. Você precisa atualizar as regras de segurança no Firebase Console.
          </p>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-6 relative group">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-slate-500 uppercase font-bold">Copie este código:</p>
              <button
                onClick={copyRules}
                className="text-xs flex items-center bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-indigo-400 transition-colors"
              >
                {copied ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="bg-black/50 p-3 rounded text-xs font-mono text-emerald-400 overflow-x-auto">
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

          <div className="text-sm text-slate-400 mb-6 space-y-2">
            <p>1. Vá em <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">console.firebase.google.com</a></p>
            <p>2. Clique no seu projeto <strong>PartnerSync</strong></p>
            <p>3. Menu esquerdo: <strong>Build</strong> &gt; <strong>Firestore Database</strong></p>
            <p>4. Aba superior: <strong>Rules</strong></p>
            <p>5. Cole o código acima e clique em <strong>Publish</strong></p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Já atualizei, tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-pulse">Carregando sistema...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (currentUser && !currentUser.companyId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Atualização Necessária</h1>
        <p className="mb-6 text-slate-400 max-w-md">
          Sua conta foi criada em uma versão anterior da plataforma e precisa ser atualizada para suportar as novas funcionalidades de Empresa.
        </p>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
          <p className="text-yellow-400 font-bold mb-2">Ação Necessária</p>
          <p className="text-sm text-slate-300">Por favor, faça logout e crie uma nova conta para gerar sua própria empresa automaticamente.</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors"
        >
          Fazer Logout e Criar Conta
        </button>
      </div>
    );
  }


  return (
    <Layout
      currentUser={currentUser}
      currentView={currentView}
      onChangeView={setCurrentView}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
      unreadCount={unreadCount}
    >
      {currentView === 'TIME_CLOCK' && <TimeTracker currentUser={currentUser} companyId={currentUser.companyId} />}
      {currentView === 'PROJECTS' && <Kanban currentUser={currentUser} companyId={currentUser.companyId} />}
      {currentView === 'CHAT' && <Chat currentUser={currentUser} companyId={currentUser.companyId} projectId="global" />}
      {currentView === 'FINANCE' && (
        <div key="finance-view" className="h-full w-full">
          <FinanceDashboard currentUser={currentUser} companyId={currentUser.companyId} />
        </div>
      )}
      {currentView === 'TEAM' && <TeamManagement currentUser={currentUser} companyId={currentUser.companyId} />}
      {currentView === 'CRM' && <CRMLayout currentUser={currentUser} companyId={currentUser.companyId} onUpdateUser={handleUpdateUser} />}
      {/* Super Admin Route */}
      {currentView === 'SUPER_ADMIN_DASHBOARD' && currentUser.role === 'SUPER_ADMIN' && (
        <SuperAdminDashboard currentUser={currentUser} />
      )}
    </Layout>
  );
};

export default App;