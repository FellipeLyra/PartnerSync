import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, MoreVertical, Lock, User as UserIcon, Building2 } from 'lucide-react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import AccessControlModal from './AccessControlModal';

interface TeamManagementProps {
    currentUser: User;
    companyId: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ currentUser, companyId }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = storageService.subscribeCompanyUsers(companyId, (data) => {
            setUsers(data);
        });
        return () => unsubscribe();
    }, [companyId]);

    const handleManageAccess = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
            {/* Header */}
            <header className="px-8 py-6 border-b border-slate-700 bg-slate-800 flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="text-indigo-400" />
                        Equipe
                    </h1>
                    <p className="text-slate-400 text-sm">Gerencie o acesso e permissões dos colaboradores</p>
                </div>
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar membro..."
                        className="bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-8 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center relative hover:border-slate-600 transition-colors group">

                            {/* Role Badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        user.role === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-slate-700 text-slate-300 border-slate-600'
                                    }`}>
                                    {user.role === 'SUPER_ADMIN' ? 'Dono' : user.role === 'ADMIN' ? 'Admin' : 'Membro'}
                                </span>
                            </div>

                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full bg-slate-700 mb-4 flex items-center justify-center overflow-hidden border-4 border-slate-800 shadow-xl">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={32} className="text-slate-500" />
                                )}
                            </div>

                            {/* Info */}
                            <h3 className="text-lg font-bold text-white mb-1">{user.username}</h3>
                            <p className="text-slate-400 text-sm mb-6">{user.email || 'Sem email'}</p>

                            {/* Permissions Summary (Optional) */}
                            <div className="w-full bg-slate-900/50 rounded-lg p-3 mb-6 text-left">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Acesso Atual</p>
                                <div className="flex flex-wrap gap-1">
                                    {user.role === 'SUPER_ADMIN' ? (
                                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">Acesso Total</span>
                                    ) : (!user.permissions?.allowedViews || user.permissions.allowedViews.length === 0) ? (
                                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 text-xs">Padrão (Limitado)</span>
                                    ) : (
                                        user.permissions.allowedViews.map(view => (
                                            <span key={view} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/10">
                                                {view === 'TIME_CLOCK' ? 'Ponto' :
                                                    view === 'PROJECTS' ? 'Projetos' :
                                                        view === 'FINANCE' ? 'Finanças' :
                                                            view === 'CHAT' ? 'Chat' : view}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => handleManageAccess(user)}
                                className="w-full py-2 bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <Lock size={16} /> Gerenciar Permissões
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <AccessControlModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                user={selectedUser}
                companyId={companyId}
            />
        </div>
    );
};

export default TeamManagement;
