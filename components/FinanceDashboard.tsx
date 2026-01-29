import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, Search, Filter, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { Transaction, User } from '../types';
import { storageService } from '../services/storageService';
import TransactionModal from './TransactionModal';

interface FinanceDashboardProps {
    currentUser: User;
    companyId: string;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ currentUser, companyId }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filterPeriod, setFilterPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        console.log("FinanceDashboard mounted for company:", companyId);
        if (!companyId) return;
        const unsubscribe = storageService.subscribeTransactions(companyId, (data) => {
            console.log("Received transactions:", data);
            setTransactions(data);
        });
        return () => unsubscribe();
    }, [companyId]);
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        balance: 0,
        pending: 0
    });


    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

    useEffect(() => {
        if (!companyId) return;
        const unsubscribe = storageService.subscribeTransactions(companyId, (data) => {
            setTransactions(data);
        });
        return () => unsubscribe();
    }, [companyId]);

    const handleOpenNew = () => {
        setEditingTransaction(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (t: Transaction) => {
        setEditingTransaction(t);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            await storageService.deleteTransaction(id);
        }
    };

    useEffect(() => {
        // Calculate Stats

        const filtered = transactions.filter(t => t.date.startsWith(filterPeriod));

        const income = filtered
            .filter(t => t.type === 'INCOME' && t.status === 'PAID')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const expense = filtered
            .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const pending = filtered
            .filter(t => t.status === 'PENDING' || t.status === 'OVERDUE')
            .reduce((acc, curr) => acc + (curr.type === 'INCOME' ? curr.amount : -curr.amount), 0);

        setStats({
            income,
            expense,
            balance: income - expense,
            pending
        });

    }, [transactions, filterPeriod]);

    const filteredTransactions = transactions.filter(t =>
        t.date.startsWith(filterPeriod) &&
        (t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
            {/* Header */}
            <header className="px-8 py-6 border-b border-slate-700 bg-slate-800 flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="text-emerald-400" />
                        Financeiro
                    </h1>
                    <p className="text-slate-400 text-sm">Gestão de receitas e despesas</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-500 transition-colors">
                        <input
                            type="month"
                            className="bg-transparent border-none outline-none text-white text-sm cursor-pointer w-full uppercase font-bold"
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleOpenNew}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-indigo-900/20"
                    >
                        <Plus size={18} />
                        Nova Transação
                    </button>
                </div>
            </header>

            {/* Dashboard Cards (Stats updated) */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 flex-shrink-0">
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Receitas (Recebido)</p>
                    <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.income)}</h3>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={48} className="text-red-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Despesas (Pago)</p>
                    <h3 className="text-2xl font-bold text-red-400">{formatCurrency(stats.expense)}</h3>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={48} className="text-indigo-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Saldo Líquido</p>
                    <h3 className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-white' : 'text-red-400'}`}>{formatCurrency(stats.balance)}</h3>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={48} className="text-amber-500" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Pendente / Atrasado</p>
                    <h3 className="text-2xl font-bold text-amber-400">{formatCurrency(stats.pending)}</h3>
                </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 px-8 pb-8 min-h-0 flex flex-col">
                <div className="bg-slate-800 border border-slate-700 rounded-xl flex-1 flex flex-col overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="font-bold text-lg">Transações</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="p-4 font-semibold">Descrição</th>
                                    <th className="p-4 font-semibold">Categoria</th>
                                    <th className="p-4 font-semibold">Data</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Valor</th>
                                    <th className="p-4 font-semibold w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            Nenhuma transação encontrada neste período.
                                        </td>
                                    </tr>
                                ) : filteredTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-medium text-white">{t.description}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                                                <Tag size={12} className="mr-1" /> {t.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {t.status === 'PAID' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    PAGO
                                                </span>
                                            )}
                                            {t.status === 'PENDING' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    PENDENTE
                                                </span>
                                            )}
                                            {t.status === 'OVERDUE' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                    <AlertTriangle size={10} className="mr-1" /> ATRASADO
                                                </span>
                                            )}
                                        </td>
                                        <td className={`p-4 text-right font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                        <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(t)} className="p-1.5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                companyId={companyId}
                currentUserInfo={{ id: currentUser.id, name: currentUser.username }}
                transaction={editingTransaction}
            />

        </div>
    );
};

export default FinanceDashboard;
