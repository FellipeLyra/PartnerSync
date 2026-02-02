import React, { useState, useEffect } from 'react';
import { FolderPlus, List, MessageSquare, Columns, Settings, AlertCircle } from 'lucide-react';
import { DEFAULT_STATUSES } from '../types';
import type { Project, Task, TaskStatus, TaskPriority, User, Column } from '../types';
import { storageService } from '../services/storageService';
import { KanbanColumn } from './kanban/KanbanColumn';
import { TaskModal } from './kanban/TaskModal';
import Chat from './Chat';

interface KanbanProps {
    currentUser?: User;
    companyId: string;
    initialProjectId?: string;
    initialShowChat?: boolean;
}

const Kanban: React.FC<KanbanProps> = ({ currentUser, companyId, initialProjectId, initialShowChat }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string>('');

    // Modals State
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);

    // Task Modal State
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(DEFAULT_STATUSES.TODO);

    const [showProjectChat, setShowProjectChat] = useState(false);

    // Data State
    const [newProjectName, setNewProjectName] = useState('');
    const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '' });

    // Column Management State
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumnForm, setNewColumnForm] = useState({ title: '', colorClass: 'text-indigo-400' });
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

    // Filtered Projects based on permissions
    useEffect(() => {
        if (!companyId) return;
        const unsubscribe = storageService.subscribeProjects(companyId, (loadedProjects) => {
            const visibleProjects = loadedProjects.filter(p => {
                if (!currentUser) return true;
                if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') return true;
                if (!currentUser.permissions) return true;

                const { allowedProjectIds } = currentUser.permissions;
                if (allowedProjectIds === undefined) return true;
                return allowedProjectIds.includes(p.id);
            });

            setProjects(visibleProjects);

            setActiveProjectId(currentId => {
                if (initialProjectId && visibleProjects.some(p => p.id === initialProjectId)) {
                    return initialProjectId;
                }
                const savedId = localStorage.getItem('lastActiveProjectId');
                if (currentId && visibleProjects.find(p => p.id === currentId)) {
                    return currentId;
                }
                if (!currentId && savedId && visibleProjects.find(p => p.id === savedId)) {
                    return savedId;
                }
                if (visibleProjects.length > 0) {
                    return visibleProjects[0].id;
                }
                return '';
            });
        });
        return () => unsubscribe();
    }, [companyId, currentUser, initialProjectId]);

    useEffect(() => {
        if (initialProjectId && activeProjectId === initialProjectId && initialShowChat) {
            setShowProjectChat(true);
        }
    }, [activeProjectId, initialProjectId, initialShowChat]);

    useEffect(() => {
        if (activeProjectId) {
            localStorage.setItem('lastActiveProjectId', activeProjectId);
        }
    }, [activeProjectId]);

    useEffect(() => {
        setShowProjectChat(false);
    }, [activeProjectId]);

    // --- Project Actions ---

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        let columns: Column[] = [
            { id: DEFAULT_STATUSES.TODO, title: 'A Fazer', colorClass: 'text-pink-400', order: 0 },
            { id: DEFAULT_STATUSES.DOING, title: 'Em Progresso', colorClass: 'text-amber-400', order: 1 },
            { id: DEFAULT_STATUSES.DONE, title: 'Concluído', colorClass: 'text-emerald-400', order: 2 }
        ];

        const newProject: Project = {
            id: '',
            companyId: companyId,
            name: newProjectName,
            description: '',
            tasks: [],
            columns: columns,
            createdAt: Date.now(),
        };

        const newId = await storageService.createProject(newProject);
        setNewProjectName('');
        setShowNewProjectModal(false);
        if (newId) setActiveProjectId(newId);
    };

    const openEditProjectModal = () => {
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;
        setEditProjectForm({ name: project.name, description: project.description });
        setShowEditProjectModal(true);
    };

    const handleUpdateProject = async () => {
        if (!editProjectForm.name.trim()) return;
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        try {
            await storageService.updateProject({ ...project, name: editProjectForm.name, description: editProjectForm.description });
            setShowEditProjectModal(false);
        } catch (e) {
            alert("Erro ao atualizar projeto.");
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!activeProjectId) return;

        const projectToDeleteId = activeProjectId;
        setShowEditProjectModal(false);

        const remaining = projects.filter(p => p.id !== projectToDeleteId);
        setProjects(remaining);
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : '');

        try {
            await storageService.deleteProject(projectToDeleteId);
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir projeto.");
        }
    };

    // --- Column Actions ---

    const getEffectiveColumns = (project?: Project): Column[] => {
        if (!project) return [];
        if (project.columns && project.columns.length > 0) {
            return [...project.columns].sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        return [
            { id: DEFAULT_STATUSES.TODO, title: 'A Fazer', colorClass: 'text-pink-400', order: 0 },
            { id: DEFAULT_STATUSES.DOING, title: 'Em Progresso', colorClass: 'text-amber-400', order: 1 },
            { id: DEFAULT_STATUSES.DONE, title: 'Concluído', colorClass: 'text-emerald-400', order: 2 }
        ];
    };

    const handleSaveColumn = async () => {
        if (!newColumnForm.title.trim() || !activeProjectId) return;
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        const currentColumns = getEffectiveColumns(project);
        let updatedColumns = [...currentColumns];

        if (editingColumnId) {
            updatedColumns = updatedColumns.map(c =>
                c.id === editingColumnId
                    ? { ...c, title: newColumnForm.title, colorClass: newColumnForm.colorClass }
                    : c
            );
        } else {
            const newId = `col-${Date.now()}`;
            const newColumn: Column = {
                id: newId,
                title: newColumnForm.title,
                colorClass: newColumnForm.colorClass,
                order: currentColumns.length
            };
            updatedColumns.push(newColumn);
        }

        await storageService.updateProject({ ...project, columns: updatedColumns });
        setShowAddColumnModal(false);
        setNewColumnForm({ title: '', colorClass: 'text-indigo-400' });
        setEditingColumnId(null);
    };

    const handleDeleteColumn = async (colId: string) => {
        if (!activeProjectId) return;
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        const currentColumns = getEffectiveColumns(project);
        const updatedColumns = currentColumns.filter(c => c.id !== colId);
        updatedColumns.forEach((c, idx) => c.order = idx);

        await storageService.updateProject({ ...project, columns: updatedColumns });
    };

    const handleColumnDragStart = (e: React.DragEvent, colId: string) => {
        setDraggedColumnId(colId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleColumnDrop = async (e: React.DragEvent, targetColId: string) => {
        e.preventDefault();
        if (!draggedColumnId || !activeProjectId || draggedColumnId === targetColId) return;

        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        const columns = [...getEffectiveColumns(project)];
        const dragIdx = columns.findIndex(c => c.id === draggedColumnId);
        const targetIdx = columns.findIndex(c => c.id === targetColId);

        if (dragIdx === -1 || targetIdx === -1) return;

        const [movedCol] = columns.splice(dragIdx, 1);
        columns.splice(targetIdx, 0, movedCol);
        columns.forEach((c, idx) => c.order = idx);

        setDraggedColumnId(null);
        await storageService.updateProject({ ...project, columns });
    };

    // --- Task Actions ---

    // 1. Prepare Modal
    const handleOpenTaskModal = (task?: Task, defaultStatus: TaskStatus = DEFAULT_STATUSES.TODO) => {
        setEditingTask(task || null);
        setNewTaskStatus(task ? task.status : defaultStatus);
        setShowTaskModal(true);
    };

    // 2. Save Logic (Called by TaskModal)
    const handleSaveTask = async (taskData: Partial<Task>) => {
        if (!activeProjectId) return;
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        let updatedTasks = [...project.tasks];

        if (editingTask) {
            updatedTasks = updatedTasks.map(t =>
                t.id === editingTask.id ? { ...t, ...taskData } : t
            );
        } else {
            const newTask: Task = {
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: taskData.content || '',
                description: taskData.description,
                status: taskData.status || newTaskStatus,
                priority: taskData.priority || 'MEDIUM',
                dueDate: taskData.dueDate,
                mediaUrl: taskData.mediaUrl,
                createdAt: Date.now(),
            };
            updatedTasks.push(newTask);
        }

        await storageService.updateProject({ ...project, tasks: updatedTasks });
    };

    const handleDeleteTask = async (taskId: string) => {
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;
        const newTasks = project.tasks.filter(t => t.id !== taskId);
        setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, tasks: newTasks } : p));
        await storageService.updateProject({ ...project, tasks: newTasks });
    };

    // --- Drag and Drop (Task) ---
    // Kept simplified in Kanban, but logic delegated to specific handlers

    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const handleTaskDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleTaskDropOnColumn = async (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedTaskId || !activeProjectId) return;

        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        const task = project.tasks.find(t => t.id === draggedTaskId);
        if (task && task.status !== status) {
            const otherTasks = project.tasks.filter(t => t.id !== draggedTaskId);
            const updatedTasks = [...otherTasks, { ...task, status }];
            await storageService.updateProject({ ...project, tasks: updatedTasks });
        }
        setDraggedTaskId(null);
    };

    const handleTaskDropOnCard = async (e: React.DragEvent, targetTaskId: string, targetStatus: TaskStatus) => {
        e.stopPropagation();
        e.preventDefault();

        if (!draggedTaskId || !activeProjectId || draggedTaskId === targetTaskId) return;

        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        const tasksCopy = [...project.tasks];
        const draggedIndex = tasksCopy.findIndex(t => t.id === draggedTaskId);
        const targetIndex = tasksCopy.findIndex(t => t.id === targetTaskId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [movedTask] = tasksCopy.splice(draggedIndex, 1);
        movedTask.status = targetStatus;

        // Find new index again because splice shifted things
        const newTargetIndex = tasksCopy.findIndex(t => t.id === targetTaskId);
        // Insert *before* or *after*? Standard is usually before if moving up, or specific.
        // Let's just insert at newTargetIndex to simplify.
        tasksCopy.splice(newTargetIndex, 0, movedTask);

        await storageService.updateProject({ ...project, tasks: tasksCopy });
        setDraggedTaskId(null);
    };


    // --- Render ---

    const activeProject = projects.find((p) => p.id === activeProjectId);

    return (
        <div className="flex h-full flex-col relative overflow-hidden bg-white dark:bg-slate-900 transition-colors">
            {/* Header (Simplified) */}
            <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between flex-shrink-0 transition-colors">
                <div className="flex items-center space-x-3">
                    <List className="text-indigo-400" />
                    <select
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 min-w-[200px] transition-colors"
                        value={activeProjectId}
                        onChange={(e) => setActiveProjectId(e.target.value)}
                    >
                        {projects.length === 0 && <option value="">Sem projetos</option>}
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => { setEditingColumnId(null); setNewColumnForm({ title: '', colorClass: 'text-indigo-400' }); setShowAddColumnModal(true); }} disabled={!activeProjectId} className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg">
                        <Columns size={18} />
                    </button>
                    <button onClick={openEditProjectModal} disabled={!activeProjectId} className="p-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg">
                        <Settings size={18} />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setShowProjectChat(!showProjectChat)} disabled={!activeProjectId} className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${showProjectChat ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <MessageSquare size={16} />
                        <span className="hidden md:inline">Chat</span>
                    </button>
                    <button onClick={() => setShowNewProjectModal(true)} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg shadow-indigo-900/50">
                        <FolderPlus size={16} />
                        <span className="hidden md:inline">Novo Projeto</span>
                    </button>
                </div>
            </header>

            {/* Board Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {activeProject ? (
                    <div className="flex-1 flex flex-col p-6 overflow-hidden">
                        <div className="mb-2 px-1 flex-shrink-0">
                            <p className="text-slate-600 dark:text-slate-400 text-sm italic truncate transition-colors">{activeProject.description}</p>
                        </div>
                        <div className="flex-1 overflow-x-auto min-h-0 custom-scrollbar pb-4">
                            <div className="flex space-x-6 h-full min-w-max">
                                {getEffectiveColumns(activeProject).map(col => (
                                    <KanbanColumn
                                        key={col.id}
                                        column={col}
                                        tasks={activeProject.tasks.filter(t => t.status === col.id)}
                                        activeProjectId={activeProjectId}
                                        onEditColumn={(c) => { setEditingColumnId(c.id); setNewColumnForm({ title: c.title, colorClass: c.colorClass }); setShowAddColumnModal(true); }}
                                        onDeleteColumn={handleDeleteColumn}
                                        onColumnDragStart={handleColumnDragStart}
                                        onColumnDrop={handleColumnDrop}
                                        onColumnDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                        onTaskDragStart={handleTaskDragStart}
                                        onTaskDragOver={handleTaskDragOver}
                                        onTaskDropOnColumn={handleTaskDropOnColumn}
                                        onTaskDropOnCard={handleTaskDropOnCard}
                                        onEditTask={handleOpenTaskModal}
                                        onDeleteTask={handleDeleteTask}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <FolderPlus size={64} className="mb-4 opacity-50" />
                        <p className="text-xl font-medium">Selecione ou crie um projeto para começar</p>
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSave={handleSaveTask}
                initialTask={editingTask}
                defaultStatus={newTaskStatus}
            />

            {/* KEEP EXISTING MODALS: PROJECT / COLUMN (Ideally extracting them too, but for now focusing on main board) */}
            {/* Project Modals */}
            {showNewProjectModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-96 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Novo Projeto</h2>
                        <input type="text" placeholder="Nome do Projeto" className="w-full p-2 border rounded mb-4" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowNewProjectModal(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                            <button onClick={handleCreateProject} className="px-4 py-2 bg-indigo-600 text-white rounded">Criar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            {showEditProjectModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-96 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold dark:text-white">Configurações do Projeto</h2>
                            <button onClick={(e) => handleDeleteProject(e)} className="text-red-500 hover:text-red-700 text-sm flex items-center">
                                <AlertCircle size={14} className="mr-1" /> Excluir Projeto
                            </button>
                        </div>
                        <input type="text" placeholder="Nome" className="w-full p-2 border rounded mb-4" value={editProjectForm.name} onChange={e => setEditProjectForm({ ...editProjectForm, name: e.target.value })} />
                        <textarea placeholder="Descrição" className="w-full p-2 border rounded mb-4" value={editProjectForm.description} onChange={e => setEditProjectForm({ ...editProjectForm, description: e.target.value })} />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowEditProjectModal(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                            <button onClick={handleUpdateProject} className="px-4 py-2 bg-indigo-600 text-white rounded">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Column Modal */}
            {showAddColumnModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-96 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">{editingColumnId ? 'Editar Coluna' : 'Nova Coluna'}</h2>
                        <input type="text" placeholder="Título da Coluna" className="w-full p-2 border rounded mb-4" value={newColumnForm.title} onChange={e => setNewColumnForm({ ...newColumnForm, title: e.target.value })} />
                        <label className="block mb-2 text-sm text-slate-600 dark:text-slate-400">Cor do Título:</label>
                        <div className="flex space-x-2 mb-6">
                            {['text-pink-400', 'text-amber-400', 'text-emerald-400', 'text-blue-400', 'text-purple-400'].map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => setNewColumnForm({ ...newColumnForm, colorClass: cls })}
                                    className={`w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 ${cls.replace('text', 'bg')} ${newColumnForm.colorClass === cls ? 'ring-2 ring-indigo-500' : ''}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowAddColumnModal(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                            <button onClick={handleSaveColumn} className="px-4 py-2 bg-indigo-600 text-white rounded">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kanban;