import React from 'react';
import { Search, LayoutList, KanbanSquare, Calendar, User as UserIcon } from 'lucide-react';
import { User, Project } from '../../types';

interface ProjectHeaderProps {
    currentView: 'LIST' | 'BOARD' | 'CALENDAR';
    onViewChange: (view: 'LIST' | 'BOARD' | 'CALENDAR') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    title: string;
    users?: User[];
    project?: Project;
    onAssignProject?: (userId: string) => void;
    currentUser?: User;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
    currentView,
    onViewChange,
    searchQuery,
    onSearchChange,
    title,
    users = [],
    project,
    onAssignProject,
    currentUser
}) => {
    return (
        <div className="px-6 py-5 flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between border-b border-transparent">

            {/* Title & Assignment */}
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
                </div>
                {project && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && onAssignProject && (
                    <div className="flex items-center mt-1 text-sm text-slate-500">
                        <span className="mr-2">Responsável:</span>
                        <select
                            value={project.assignedUserId || ''}
                            onChange={(e) => onAssignProject(e.target.value)}
                            className="bg-transparent border-none p-0 text-indigo-600 font-medium focus:ring-0 cursor-pointer hover:underline"
                        >
                            <option value="">Ninguém</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>
                )}
                {project && project.assignedUserId && !(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
                    <div className="flex items-center mt-1 text-sm text-slate-500">
                        <span className="mr-2">Responsável:</span>
                        <span className="text-indigo-600 font-medium">
                            {users.find(u => u.id === project.assignedUserId)?.username || 'Desconhecido'}
                        </span>
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar tarefas..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
            </div>

            {/* View Toggles */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
                <button
                    onClick={() => onViewChange('LIST')}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'LIST'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    title="Lista"
                >
                    <LayoutList size={18} />
                </button>
                <button
                    onClick={() => onViewChange('BOARD')}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'BOARD'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    title="Kanban"
                >
                    <KanbanSquare size={18} />
                </button>
                <button
                    onClick={() => onViewChange('CALENDAR')}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'CALENDAR'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    title="Calendário"
                >
                    <Calendar size={18} />
                </button>
            </div>
        </div>
    );
};
