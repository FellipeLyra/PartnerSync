import React, { useState, useEffect } from 'react';
import { User, Deal, TaskStatus, Client } from '../../types'; // Re-trigger save
import { crmService } from '../../services/crmService';
import { financeService } from '../../services/financeService';
import { Plus, MoreVertical, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

interface PipelineBoardProps {
    currentUser: User;
    companyId: string;
}

// Fixed stages for MVP, can be dynamic later
const STAGES = [
    { id: 'PROSPECT', title: 'Prospecção', color: 'border-blue-500' },
    { id: 'QUALIFICATION', title: 'Qualificação', color: 'border-purple-500' },
    { id: 'PROPOSAL', title: 'Proposta', color: 'border-yellow-500' },
    { id: 'NEGOTIATION', title: 'Negociação', color: 'border-orange-500' },
    { id: 'WON', title: 'Fechado (Ganho)', color: 'border-emerald-500' },
    { id: 'LOST', title: 'Perdido', color: 'border-red-500' }
];

const PipelineBoard: React.FC<PipelineBoardProps> = ({ currentUser, companyId }) => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Deal>>({ stageId: 'PROSPECT', status: 'OPEN' });
    const { addToast } = useToast();
    const confirm = useConfirm();

    useEffect(() => {
        const unsubDeals = crmService.subscribeDeals(companyId, (data) => setDeals(data));
        const unsubClients = crmService.subscribeClients(companyId, (data) => setClients(data));
        return () => { unsubDeals(); unsubClients(); };
    }, [companyId]);

    const handleDragStart = (e: React.DragEvent, dealId: string) => {
        setDraggedDealId(dealId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        if (!draggedDealId) return;

        const deal = deals.find(d => d.id === draggedDealId);
        if (deal && deal.stageId !== stageId) {
            let status: 'OPEN' | 'WON' | 'LOST' = 'OPEN';
            if (stageId === 'WON') status = 'WON';
            if (stageId === 'LOST') status = 'LOST';

            await crmService.saveDeal({ ...deal, stageId, status });

            // AUTOMATION: Create Income Transaction if WON
            if (status === 'WON' && deal.stageId !== 'WON') {
                await financeService.saveTransaction({
                    id: '',
                    companyId,
                    description: `Venda CRM: ${deal.title}`,
                    amount: deal.value,
                    type: 'INCOME',
                    category: 'Vendas',
                    date: new Date().toISOString().split('T')[0],
                    status: 'PAID', // Defined as PAID per user request
                    createdAt: Date.now(),
                    createdBy: currentUser.id
                });
                addToast("Receita registrada no financeiro!", 'success');
            }
        }
        setDraggedDealId(null);
    };

    const handleSave = async () => {
        if (!formData.title || !companyId || !formData.clientId) {
            addToast("Preencha o título e selecione um cliente.", 'warning');
            return;
        }

        const dealToSave: Deal = {
            id: formData.id || '',
            companyId: companyId,
            clientId: formData.clientId,
            title: formData.title,
            value: Number(formData.value) || 0,
            stageId: formData.stageId || 'PROSPECT',
            status: formData.status || 'OPEN',
            probability: Number(formData.probability) || 50,
            expectedCloseDate: formData.expectedCloseDate,
            createdAt: formData.createdAt || Date.now(),
            updatedAt: Date.now()
        };

        try {
            await crmService.saveDeal(dealToSave);
            setShowModal(false);
            setFormData({ stageId: 'PROSPECT', status: 'OPEN' });
            addToast("Negócio salvo com sucesso!", 'success');
        } catch (e) {
            addToast("Erro ao salvar negócio.", 'error');
        }
    };

    const getStageTotal = (stageId: string) => {
        return deals
            .filter(d => d.stageId === stageId)
            .reduce((acc, curr) => acc + (curr.value || 0), 0);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* ACTION BAR */}
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-end transition-colors">
                <button
                    onClick={() => { setFormData({ stageId: 'PROSPECT', status: 'OPEN' }); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg font-bold transition-colors"
                >
                    <Plus size={18} className="mr-2" />
                    Novo Negócio
                </button>
            </div>

            {/* BOARD */}
            <div className="flex-1 overflow-x-auto min-h-0 p-6 custom-scrollbar">
                <div className="flex space-x-4 h-full min-w-max">
                    {STAGES.map(stage => (
                        <div
                            key={stage.id}
                            className="w-80 flex-col flex h-full rounded-xl bg-gray-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 transition-colors"
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* HEADER */}
                            <div className={`p-3 border-t-4 ${stage.color} bg-white dark:bg-slate-800 rounded-t-xl transition-colors`}>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{stage.title}</h3>
                                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full">{deals.filter(d => d.stageId === stage.id).length}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                    Total: R$ {getStageTotal(stage.id).toLocaleString('pt-BR')}
                                </div>
                            </div>

                            {/* CARDS */}
                            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-2">
                                {deals.filter(d => d.stageId === stage.id).map(deal => {
                                    const client = clients.find(c => c.id === deal.clientId);
                                    return (
                                        <div
                                            key={deal.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, deal.id)}
                                            onClick={() => { setFormData(deal); setShowModal(true); }}
                                            className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:border-indigo-500 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{deal.title}</span>
                                            </div>

                                            {client && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                                                    {client.name} {client.organizationName ? `(${client.organizationName})` : ''}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-600/50">
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                    R$ {deal.value.toLocaleString('pt-BR')}
                                                </span>
                                                {deal.expectedCloseDate && (
                                                    <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500" title="Previsão de fechamento">
                                                        <Calendar size={10} className="mr-1 text-slate-500 dark:text-white" />
                                                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in-up transition-colors">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{formData.id ? 'Editar Negócio' : 'Novo Negócio'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Título do Negócio *</label>
                                <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Ex: Contrato Anual Desenvolvimento" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cliente *</label>
                                <select
                                    value={formData.clientId || ''}
                                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} {c.organizationName ? `- ${c.organizationName}` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Valor (R$) *</label>
                                    <input type="number" value={formData.value || ''} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Previsão Fechamento</label>
                                    <input type="date" value={formData.expectedCloseDate || ''} onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors dark:[color-scheme:dark]" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Etapa do Funil</label>
                                <select
                                    value={formData.stageId || 'PROSPECT'}
                                    onChange={e => setFormData({ ...formData, stageId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                >
                                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8">
                            {formData.id && (
                                <button type="button" onClick={async () => {
                                    if (await confirm({
                                        title: 'Excluir Negócio?',
                                        message: 'Tem certeza que deseja excluir este negócio?',
                                        isDestructive: true
                                    })) {
                                        await crmService.deleteDeal(formData.id!);
                                        setShowModal(false);
                                        addToast("Negócio excluído.", 'success');
                                    }
                                }} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm">Excluir</button>
                            )}
                            <div className="flex space-x-3 ml-auto">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Cancelar</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg transition-colors">Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineBoard;
