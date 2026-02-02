import React from 'react';
import { Search, LayoutList, KanbanSquare, Calendar, Filter } from 'lucide-react';

interface ProjectHeaderProps {
    currentView: 'LIST' | 'BOARD' | 'CALENDAR';
    onViewChange: (view: 'LIST' | 'BOARD' | 'CALENDAR') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    title: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
    currentView,
    onViewChange,
    searchQuery,
    onSearchChange,
    title
}) => {
    return (
        <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-transparent">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar tarefas..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
            </div>

            {/* View Toggles & Title (Mobile) */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm self-end md:self-auto">
                <button
                    onClick={() => onViewChange('LIST')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'LIST'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                >
                    <LayoutList size={18} className="mr-2" />
                    Lista
                </button>
                <button
                    onClick={() => onViewChange('BOARD')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'BOARD'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                >
                    <KanbanSquare size={18} className="mr-2" />
                    Kanban
                </button>
                <button
                    onClick={() => onViewChange('CALENDAR')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'CALENDAR'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                >
                    <Calendar size={18} className="mr-2" />
                    Calendário
                </button>
            </div>
        </div>
    );
};
