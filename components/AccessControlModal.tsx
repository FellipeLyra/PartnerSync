import React, { useState, useEffect } from 'react';
import { X, Save, Lock, Layout, Folder, CheckSquare } from 'lucide-react';
import { User, Project, ViewState } from '../types';
import { storageService } from '../services/storageService';

interface AccessControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    companyId: string;
}

const AVAILABLE_VIEWS: { id: ViewState; label: string }[] = [
    { id: 'TIME_CLOCK', label: 'Bater Ponto' },
    { id: 'PROJECTS', label: 'Projetos (Kanban)' },
    { id: 'CHAT', label: 'Chat da Equipe' },
    { id: 'FINANCE', label: 'Financeiro' },
    { id: 'TEAM', label: 'Gestão de Equipe' },
];

export default function AccessControlModal({ isOpen, onClose, user, companyId }: AccessControlModalProps) {
    const [allowedViews, setAllowedViews] = useState<ViewState[]>([]);
    const [allowedProjects, setAllowedProjects] = useState<string[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            // Load initial permissions
            setAllowedViews(user.permissions?.allowedViews || []);
            setAllowedProjects(user.permissions?.allowedProjectIds || []);

            // Load Company Projects
            storageService.getCompanyProjects(companyId).then(setAllProjects);
        }
    }, [isOpen, user, companyId]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await storageService.updateUserPermissions(user.id, {
                allowedViews,
                allowedProjectIds: allowedProjects
            });
            onClose();
        } catch (error) {
            console.error("Error updating permissions:", error);
            alert("Erro ao salvar permissões.");
        } finally {
            setLoading(false);
        }
    };

    const toggleView = (viewId: ViewState) => {
        setAllowedViews(prev =>
            prev.includes(viewId) ? prev.filter(v => v !== viewId) : [...prev, viewId]
        );
    };

    const toggleProject = (projectId: string) => {
        setAllowedProjects(prev => {
            if (prev.includes(projectId)) {
                return prev.filter(p => p !== projectId);
            } else {
                return [...prev, projectId];
            }
        });
    };

    const toggleAllProjects = () => {
        if (allowedProjects.length === allProjects.length) {
            setAllowedProjects([]); // Deselect all
        } else {
            setAllowedProjects(allProjects.map(p => p.id)); // Select all
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock size={20} className="text-indigo-400" />
                            Gerenciar Acesso
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Colaborador: <span className="text-white font-medium">{user.username}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">

                    {/* Module Access */}
                    <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layout size={16} /> Módulos Permitidos
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {AVAILABLE_VIEWS.map(view => (
                                <label key={view.id} className="flex items-center p-3 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors group">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-indigo-600 rounded bg-slate-800 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                        checked={allowedViews.includes(view.id)}
                                        onChange={() => toggleView(view.id)}
                                    />
                                    <span className="ml-3 text-slate-300 group-hover:text-white transition-colors">{view.label}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Project Access */}
                    {allowedViews.includes('PROJECTS') && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Folder size={16} /> Projetos Permitidos
                                </h4>
                                <button
                                    onClick={toggleAllProjects}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                    {allowedProjects.length === allProjects.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                                </button>
                            </div>

                            {allProjects.length === 0 ? (
                                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm">
                                    Nenhum projeto encontrado nesta empresa.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {allProjects.map(project => (
                                        <label key={project.id} className="flex items-center p-3 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors group">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-emerald-600 rounded bg-slate-800 border-slate-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                                                checked={allowedProjects.includes(project.id)}
                                                onChange={() => toggleProject(project.id)}
                                            />
                                            <span className="ml-3 text-slate-300 group-hover:text-white transition-colors truncate">
                                                {project.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                                * Se nenhum projeto for selecionado, o usuário não verá nada no Kanban.
                            </p>
                        </section>
                    )}
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium flex items-center shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} className="mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Permissões'}
                    </button>
                </div>
            </div>
        </div>
    );
}
