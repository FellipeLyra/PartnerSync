import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit2, List, Save, GripHorizontal, Video, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { Task, TaskPriority, TaskStatus, User } from '../../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: Partial<Task>) => Promise<void>;
    initialTask: Task | null; // If null, mode is CREATE
    defaultStatus?: TaskStatus; // Used if initialTask is null
    users: User[];
    currentUser: User;
}

export const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialTask,
    defaultStatus = DEFAULT_STATUSES.TODO,
    users,
    currentUser
}) => {
    const [formData, setFormData] = useState({
        content: '',
        description: '',
        priority: 'MEDIUM' as TaskPriority,
        dueDate: '',
        mediaUrl: '',
        status: defaultStatus,
        assignee: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialTask) {
                setFormData({
                    content: initialTask.content || '',
                    description: initialTask.description || '',
                    priority: initialTask.priority,
                    dueDate: initialTask.dueDate || '',
                    mediaUrl: initialTask.mediaUrl || '',
                    status: initialTask.status,
                    assignee: initialTask.assignee || ''
                });
            } else {
                setFormData({
                    content: '',
                    description: '',
                    priority: 'MEDIUM',
                    dueDate: '',
                    mediaUrl: '',
                    status: defaultStatus,
                    assignee: ''
                });
            }
        }
    }, [isOpen, initialTask, defaultStatus]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(formData.content || '').trim()) return;

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving task:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center text-slate-800 dark:text-white">
                        <Edit2 size={20} className="mr-2 text-indigo-500" />
                        {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">O que precisa ser feito?</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="Ex: Criar design da landing page..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prioridade</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white cursor-pointer"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                                <option value="URGENT">Urgente</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                                <Calendar size={14} className="mr-1.5" /> Data de Entrega
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                            <List size={14} className="mr-1.5" /> Descrição
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 min-h-[100px] resize-none"
                            placeholder="Detalhes adicionais..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mídia / Anexo (URL)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
                            placeholder="https://..."
                            value={formData.mediaUrl}
                            onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                        />
                    </div>

                    {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Atribuir a</label>
                            <select
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white cursor-pointer"
                                value={formData.assignee}
                                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                            >
                                <option value="">Sem responsável</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </form>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !(formData.content || '').trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSaving ? (
                            <span className="animate-pulse">Salvando...</span>
                        ) : (
                            <>
                                <Save size={20} className="mr-2" />
                                {initialTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
