import React, { useEffect, useState } from 'react';
import { Company, User } from '../types';
import { storageService } from '../services/storageService';
import { Building, Users, Calendar, Trash2, Activity } from 'lucide-react';

interface SuperAdminDashboardProps {
    currentUser: User;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ currentUser }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'COMPANIES' | 'USERS'>('COMPANIES');

    const fetchData = async () => {
        setLoading(true);
        const [fetchedCompanies, fetchedUsers] = await Promise.all([
            storageService.getAllCompanies(),
            storageService.getAllUsers()
        ]);
        setCompanies(fetchedCompanies);
        setUsers(fetchedUsers);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteCompany = async (companyId: string) => {
        if (window.confirm("ATENÇÃO: Isso excluirá permanentemente a empresa. Tem certeza?")) {
            await storageService.deleteCompany(companyId);
            fetchData();
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
            await storageService.deleteUser(userId);
            fetchData();
        }
    };

    const getCompanyUserCount = (companyId: string) => {
        return users.filter(u => u.companyId === companyId).length;
    };

    const getCompanyName = (companyId: string) => {
        const comp = companies.find(c => c.id === companyId);
        return comp ? comp.name : 'Sem Empresa';
    };

    const handleResetSystem = async () => {
        const confirm1 = window.confirm("PERIGO EXTREMO: Isso apagará TODAS as empresas, usuários e projetos do banco de dados.");
        if (!confirm1) return;

        const confirm2 = window.confirm("Tem certeza absoluta? Essa ação é irreversível e vai zerar a plataforma.");
        if (!confirm2) return;

        const confirm3 = prompt("Digite 'ZERAR' para confirmar:");
        if (confirm3 !== 'ZERAR') {
            alert("Ação cancelada.");
            return;
        }

        setLoading(true);
        try {
            await storageService.resetDatabase();
            alert("Sistema zerado com sucesso. Você será deslogado.");
            window.location.reload();
        } catch (e) {
            alert("Erro ao zerar sistema.");
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Carregando dados globais...</div>;
    }

    return (
        <div className="p-6 h-screen overflow-y-auto bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
            <h1 className="text-3xl font-bold mb-8 flex items-center text-slate-800 dark:text-white">
                <Activity className="mr-3 text-red-500" />
                Painel do Super Admin
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Empresas</h3>
                        <Building className="text-indigo-500 dark:text-indigo-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{companies.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Usuários</h3>
                        <Users className="text-emerald-500 dark:text-emerald-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{users.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Média Usuários/Empresa</h3>
                        <Activity className="text-amber-500 dark:text-amber-400" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {companies.length > 0 ? (users.length / companies.length).toFixed(1) : 0}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('COMPANIES')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'COMPANIES' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                >
                    Gerenciar Empresas
                </button>
                <button
                    onClick={() => setActiveTab('USERS')}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'USERS' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                >
                    Gerenciar Usuários
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
                {activeTab === 'COMPANIES' ? (
                    <>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Empresas Cadastradas</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4">Nome da Empresa</th>
                                        <th className="p-4">Código</th>
                                        <th className="p-4">Usuários</th>
                                        <th className="p-4">Criado em</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {companies.map(company => (
                                        <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800 dark:text-white">{company.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{company.id}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-indigo-600 dark:text-indigo-300">
                                                    {company.inviteCode || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center text-slate-600 dark:text-slate-400">
                                                    <Users size={14} className="mr-2" />
                                                    {getCompanyUserCount(company.id)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                                                {new Date(company.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteCompany(company.id)}
                                                    className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                    title="Excluir Empresa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Usuários Cadastrados</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4">Usuário</th>
                                        <th className="p-4">Telefone</th>
                                        <th className="p-4">Empresa</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                                                        {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : null}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white">{user.username}</div>
                                                        <div className="text-xs text-slate-500">{user.email || 'No Email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{user.phone || '-'}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{getCompanyName(user.companyId)}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                                                    user.role === 'ADMIN' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                                                        'bg-slate-100 dark:bg-slate-600/20 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {user.role !== 'SUPER_ADMIN' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                        title="Excluir Usuário"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
