import React, { useRef, useState, useEffect } from 'react';
import { Clock, KanbanSquare, MessageSquare, LogOut, Check, X, Camera, UserPlus, Copy, User as UserIcon, ShieldAlert, DollarSign, Users, Target } from 'lucide-react';
import { User, ViewState, Company } from '../types';
import { storageService } from '../services/storageService';
import AvatarEditor from './AvatarEditor';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  unreadCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, currentView, onChangeView, onLogout, onUpdateUser, unreadCount = 0 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (currentUser?.companyId) {
      storageService.getCompany(currentUser.companyId).then(setCompany);
    }
  }, [currentUser]);

  // Define all possible items first
  const allNavItems = [
    { id: 'TIME_CLOCK' as ViewState, label: 'Bater Ponto', icon: Clock },
    { id: 'PROJECTS' as ViewState, label: 'Projetos', icon: KanbanSquare },
    { id: 'CHAT' as ViewState, label: 'Chat Equipe', icon: MessageSquare },
    { id: 'FINANCE' as ViewState, label: 'Financeiro', icon: DollarSign },
    { id: 'TEAM' as ViewState, label: 'Equipe', icon: Users },
    { id: 'CRM' as ViewState, label: 'CRM & Vendas', icon: Target },
    { id: 'SUPER_ADMIN_DASHBOARD' as ViewState, label: 'Admin Dashboard', icon: ShieldAlert },
  ];

  // Filter based on Permissions and Role
  const navItems = allNavItems.filter(item => {
    // 1. Super Admin Specific
    if (item.id === 'SUPER_ADMIN_DASHBOARD') {
      return currentUser.role === 'SUPER_ADMIN';
    }

    // 2. Admin & Super Admin get access to Management Tools (Finance, Team) automatically
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') {
      return true;
    }

    // 3. Regular Members
    // If specific permissions are set, use them
    if (currentUser.permissions && currentUser.permissions.allowedViews) {
      return currentUser.permissions.allowedViews.includes(item.id);
    }

    // Default for Members (if no permissions set): Clock, Projects, Chat only.
    // Exclude Finance, Team, AdminDash
    const defaults = ['TIME_CLOCK', 'PROJECTS', 'CHAT', 'CRM'];
    return defaults.includes(item.id);
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowEditor(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveAvatar = (base64: string) => {
    onUpdateUser({ ...currentUser, avatar: base64 });
    setShowEditor(false);
    setSelectedImage(null);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 transition-colors">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">PartnerSync</h1>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentView === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/50'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'CHAT' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Actions - Fixed at bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3 flex-shrink-0 transition-colors">
          {/* Invite Button - Visible if company loaded */}
          {company && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center justify-center lg:justify-start p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition-colors"
              title="Convidar Equipe"
            >
              <UserPlus size={20} />
              <span className="ml-3 hidden lg:block font-medium text-sm">Convidar</span>
            </button>
          )}

          {/* Debug Info */}
          <div className="text-[10px] text-slate-400 dark:text-slate-500 hidden lg:block text-center lg:text-left transition-colors">
            {company ? `Co: ${company.inviteCode}` : 'Loading...'}
          </div>

          <div className="flex items-center space-x-3 mb-4">
            {/* Avatar with Click to Edit */}
            <div
              className="relative group cursor-pointer"
              onClick={handleAvatarClick}
              title="Clique para alterar foto"
            >
              <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center overflow-hidden border-2 border-slate-400 dark:border-slate-500 group-hover:border-indigo-500 transition-colors">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={24} className="text-slate-600 dark:text-slate-300" />
                )}
              </div>
              {/* Overlay Icon */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-white" />
              </div>
              {/* Hidden Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate transition-colors">{currentUser.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">Online</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {children}
      </main>

      {/* Modals */}
      {showInviteModal && company && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl animate-fade-in relative transition-all transform scale-100">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus size={32} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Convidar Equipe</h2>
              <p className="text-slate-400 mt-2">Compartilhe este código com seus colaboradores para que eles entrem na <strong>{company.name}</strong>.</p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center mb-6 relative group">
              <span className="text-4xl font-mono font-bold text-white tracking-[0.5em] pl-4 select-all">
                {company.inviteCode}
              </span>
              <p className="text-xs text-slate-500 mt-4 uppercase tracking-widest">Código Único</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(company.inviteCode);
                // Optional: Show toast
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center transform active:scale-95"
            >
              <Copy size={18} className="mr-2" />
              Copiar Código
            </button>
          </div>
        </div>
      )}

      {/* Avatar Editor Modal */}
      {showEditor && selectedImage && (
        <AvatarEditor
          imageSrc={selectedImage}
          onSave={handleSaveAvatar}
          onCancel={() => { setShowEditor(false); setSelectedImage(null); }}
        />
      )}
    </div>
  );
};

export default Layout;