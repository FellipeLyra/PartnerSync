import React, { useState } from 'react';
import Auth from './components/Auth';
import Layout from './components/Layout';
import TimeTracker from './components/TimeTracker';
import { ProjectDashboard } from './components/project/ProjectDashboard';
import Chat from './components/Chat';
import type { ViewState, User } from './types';
import { AlertTriangle, Copy, Check } from 'lucide-react';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import TeamManagement from './components/TeamManagement';
import CRMLayout from './components/crm/CRMLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import ToastContainer from './components/ui/ToastContainer';
import EmailVerification from './components/EmailVerification';

// --- SUB-COMPONENTS FOR CLEANER APP.TSX ---

const ConfigErrorView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function belongsToCompany(companyId) { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == companyId; }
    
    match /{document=**} { allow read, write: if false; }
    
    match /users/{userId} {
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow read: if isSignedIn() && (request.auth.uid == userId || belongsToCompany(resource.data.companyId));
      allow update: if isSignedIn() && request.auth.uid == userId;
    }
    
    match /companies/{companyId} {
      allow create: if isSignedIn();
      allow read: if belongsToCompany(companyId);
      allow update: if belongsToCompany(companyId) && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    match /{collection}/{docId} {
      allow create: if belongsToCompany(request.resource.data.companyId);
      allow read, update, delete: if belongsToCompany(resource.data.companyId);
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    // Helper Functions
    function isSignedIn() { return request.auth != null; }
    function belongsToCompany(companyId) { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.companyId == companyId; }
    
    match /{document=**} { allow read, write: if false; }
    
    match /users/{userId} {
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow read: if isSignedIn() && (request.auth.uid == userId || belongsToCompany(resource.data.companyId));
      allow update: if isSignedIn() && request.auth.uid == userId;
    }
    
    match /companies/{companyId} {
      allow create: if isSignedIn();
      allow read: if belongsToCompany(companyId);
      allow update: if belongsToCompany(companyId) && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Multi-tenant Collection
    match /{collection}/{docId} {
      allow create: if belongsToCompany(request.resource.data.companyId);
      allow read, update, delete: if belongsToCompany(resource.data.companyId);
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
};

const UpdateRequiredView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
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
      onClick={onLogout}
      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors"
    >
      Fazer Logout e Criar Conta
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, loading, error, login, logout, updateUser, isEmailVerified } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('TIME_CLOCK');
  const [navParams, setNavParams] = useState<any>(null);

  const handleNavigate = (view: ViewState, params?: any) => {
    setNavParams(params);
    setCurrentView(view);
  };

  const handleViewChange = (view: ViewState) => {
    setNavParams(null);
    setCurrentView(view);
  };

  const handleLogin = (user: User) => {
    login(user);
    setCurrentView('TIME_CLOCK');
  };

  if (error === 'permission-denied') {
    return <ConfigErrorView />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-pulse">Carregando sistema...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  // Enforce Email Verification
  if (!isEmailVerified) {
    return <EmailVerification />;
  }

  if (currentUser && !currentUser.companyId) {
    return <UpdateRequiredView onLogout={logout} />;
  }

  return (
    <Layout
      currentUser={currentUser}
      currentView={currentView}
      onChangeView={handleViewChange}
      onLogout={logout}
      onUpdateUser={updateUser}
      onNavigate={handleNavigate}
    >
      {currentView === 'TIME_CLOCK' && <TimeTracker currentUser={currentUser} companyId={currentUser.companyId} />}
      {currentView === 'PROJECTS' && (
        <ProjectDashboard
          currentUser={currentUser}
          companyId={currentUser.companyId}
          initialProjectId={navParams?.projectId}
        />
      )}
      {currentView === 'CHAT' && (
        <Chat
          currentUser={currentUser}
          companyId={currentUser.companyId}
          projectId={navParams?.projectId || "global"}
          initialTargetId={navParams?.targetId}
          title={navParams?.title}
        />
      )}
      {currentView === 'FINANCE' && (
        <div key="finance-view" className="h-full w-full">
          <FinanceDashboard currentUser={currentUser} companyId={currentUser.companyId} />
        </div>
      )}
      {currentView === 'TEAM' && <TeamManagement currentUser={currentUser} companyId={currentUser.companyId} />}
      {currentView === 'CRM' && <CRMLayout currentUser={currentUser} companyId={currentUser.companyId} onUpdateUser={updateUser} />}
      {/* Super Admin Route */}
      {currentView === 'SUPER_ADMIN_DASHBOARD' && currentUser.role === 'SUPER_ADMIN' && (
        <SuperAdminDashboard currentUser={currentUser} />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <ToastProvider>
          <AppContent />
          <ToastContainer />
        </ToastProvider>
      </ConfirmProvider>
    </AuthProvider>
  );
};

export default App;