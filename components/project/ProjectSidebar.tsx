import React, { useState } from 'react';
import { Layout, Calendar, Clock, AlertCircle, ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { Project } from '../../types';

interface ProjectSidebarProps {
    projects: Project[];
    activeProjectId: string;
    onSelectProject: (id: string) => void;
    currentFilter: 'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE';
    onSelectFilter: (filter: 'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE') => void;
    taskStats: {
        total: number;
        completed: number;
        overdue: number;
    };
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
    projects,
    activeProjectId,
    onSelectProject,
    currentFilter,
    onSelectFilter,
    taskStats
}) => {
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

    const menuItems = [
        { id: 'ALL', label: 'Todas as tarefas', icon: Layout },
        { id: 'TODAY', label: 'Hoje', icon: Clock },
        { id: 'UPCOMING', label: 'Próximos 7 dias', icon: Calendar },
        { id: 'OVERDUE', label: 'Atrasadas', icon: AlertCircle, count: taskStats.overdue, alert: true },
    ];

    return (
        <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full transition-colors">
            {/* Header / Title */}
            <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">

                    Gestão
                </h2>
                <div className="mt-4 flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <div><strong className="text-slate-900 dark:text-white">{taskStats.total}</strong> tarefas</div>
                    <div><strong className="text-emerald-500">{taskStats.completed}</strong> concluídas</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-6">
                {/* Main Filters */}
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelectFilter(item.id as any)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${currentFilter === item.id
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className="flex items-center">
                                <item.icon size={18} className={`mr-3 ${item.alert ? 'text-red-500' : ''}`} />
                                {item.label}
                            </div>
                            {item.count !== undefined && item.count > 0 && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.alert ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Projects List */}
                <div>
                    <button
                        onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                        className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full"
                    >
                        {isProjectsExpanded ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
                        Projetos ({projects.length})
                    </button>

                    {isProjectsExpanded && (
                        <div className="space-y-1 pl-2">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => onSelectProject(project.id)}
                                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${activeProjectId === project.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <Hash size={16} className="mr-2 opacity-50" />
                                    <span className="truncate text-left">{project.name}</span>
                                    {project.tasks.length > 0 && (
                                        <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 rounded-full">
                                            {project.tasks.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                            {projects.length === 0 && (
                                <div className="text-xs text-slate-400 italic px-3">Sem projetos.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 mt-auto">
                {/* Footer or User Ref could go here if needed, but Layout handles it */}
            </div>
        </div>
    );
};
