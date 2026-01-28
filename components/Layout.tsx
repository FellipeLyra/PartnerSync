import React, { useRef, useState } from 'react';
import { Clock, Layout as LayoutIcon, MessageSquare, LogOut, User as UserIcon, Camera } from 'lucide-react';
import { User, ViewState } from '../types';
import AvatarEditor from './AvatarEditor';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, currentView, onChangeView, onLogout, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const navItems = [
    { id: 'TIME_CLOCK' as ViewState, label: 'Bater Ponto', icon: Clock },
    { id: 'PROJECTS' as ViewState, label: 'Projetos', icon: LayoutIcon },
    { id: 'CHAT' as ViewState, label: 'Chat Equipe', icon: MessageSquare },
  ];

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
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">
            PS
          </div>
          <h1 className="font-bold text-xl tracking-tight">PartnerSync</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center space-x-3 mb-4">
            {/* Avatar with Click to Edit */}
            <div 
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
                title="Clique para alterar foto"
            >
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden border-2 border-slate-500 group-hover:border-indigo-500 transition-colors">
                   {currentUser.avatar ? (
                     <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon size={24} className="text-slate-300" />
                   )}
                </div>
                {/* Overlay Icon */}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={14} className="text-white"/>
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
              <p className="text-sm font-semibold text-white truncate">{currentUser.username}</p>
              <p className="text-xs text-slate-400 truncate">Online</p>
            </div>
          </div>
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