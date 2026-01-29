import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar, Tag, FileText, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';
import { storageService } from '../services/storageService';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    currentUserInfo: { id: string, name: string };
    transaction?: Transaction; // Verify if editing
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, companyId, currentUserInfo, transaction }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [status, setStatus] = useState<'PAID' | 'PENDING'>('PAID');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(transaction.amount.toString());
            setType(transaction.type);
            setCategory(transaction.category);
            setDate(transaction.date);
            setStatus(transaction.status);
        } else {
            // Reset for new
            setDescription('');
            setAmount('');
            setType('EXPENSE');
            setCategory('');
            setDate(new Date().toISOString().slice(0, 10));
            setStatus('PAID');
        }
    }, [transaction, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting form...", { description, amount, category });
        if (!description || !amount || !category) {
            console.warn("Validation failed");
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        setLoading(true);
        try {
            const cleanAmount = amount.replace(/\./g, '').replace(',', '.'); // Remove thousand separators (dots) and replace decimal comma
            const parsedAmount = parseFloat(cleanAmount);

            if (isNaN(parsedAmount)) {
                alert("Valor inválido");
                return;
            }

            const payload: Transaction = {
                id: transaction?.id || '', // Empty for new
                companyId,
                description,
                amount: parsedAmount,
                type,
                category,
                date,
                status,
                createdAt: transaction?.createdAt || Date.now(),
                createdBy: transaction?.createdBy || currentUserInfo.id
            };
            console.log("Saving payload:", payload);

            if (transaction) {
                await storageService.updateTransaction(payload);
            } else {
                await storageService.saveTransaction(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar transação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        {transaction ? <Save size={20} className="mr-2 text-indigo-400" /> : <DollarSign size={20} className="mr-2 text-emerald-400" />}
                        {transaction ? 'Editar Transação' : 'Nova Transação'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('INCOME')}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${type === 'INCOME'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                                }`}
                        >
                            <ArrowUpCircle size={20} className="mr-2" /> Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('EXPENSE')}
                            className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all ${type === 'EXPENSE'
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                                }`}
                        >
                            <ArrowDownCircle size={20} className="mr-2" /> Despesa
                        </button>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Ex: Pagamento de Site"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 text-slate-500" size={18} />
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                                    required
                                >
                                    <option value="" disabled>Selecione...</option>
                                    <option value="Serviços">Serviços</option>
                                    <option value="Produtos">Produtos</option>
                                    <option value="Aluguel">Aluguel</option>
                                    <option value="Salários">Salários</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Impostos">Impostos</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                            <div className="grid grid-cols-3 bg-slate-900 rounded-lg p-1 border border-slate-600 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setStatus('PAID')}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm font-medium transition-all ${status === 'PAID' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <CheckCircle size={14} className="mr-1.5" /> Pago
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('PENDING')}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm font-medium transition-all ${status === 'PENDING' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <Clock size={14} className="mr-1.5" /> Pendente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('OVERDUE')}
                                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-sm font-medium transition-all ${status === 'OVERDUE' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    <AlertTriangle size={14} className="mr-1.5" /> Atrasado
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-700 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg flex items-center font-bold shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Salvando...' : 'Salvar Transação'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
