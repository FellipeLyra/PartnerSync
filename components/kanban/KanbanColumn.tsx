import React from 'react';
import { Edit2, X, Plus, GripHorizontal } from 'lucide-react';
import type { Column, Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
    column: Column;
    tasks: Task[];
    activeProjectId: string;
    // Column Actions
    onEditColumn: (col: Column) => void;
    onDeleteColumn: (colId: string) => void;
    onColumnDragStart: (e: React.DragEvent, colId: string) => void;
    onColumnDrop: (e: React.DragEvent, targetColId: string) => void;
    onColumnDragOver: (e: React.DragEvent) => void;
    // Task Actions passed down
    onTaskDropOnColumn: (e: React.DragEvent, status: TaskStatus) => void;
    onTaskDropOnCard: (e: React.DragEvent, targetTaskId: string, targetStatus: TaskStatus) => void;
    onTaskDragStart: (e: React.DragEvent, taskId: string) => void;
    onTaskDragOver: (e: React.DragEvent) => void;
    onEditTask: (task?: Task, defaultStatus?: TaskStatus) => void; // Used for "Add Card" too (task undefined)
    onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    column,
    tasks,
    activeProjectId,
    onEditColumn,
    onDeleteColumn,
    onColumnDragStart,
    onColumnDrop,
    onColumnDragOver,
    onTaskDropOnColumn,
    onTaskDropOnCard,
    onTaskDragStart,
    onTaskDragOver,
    onEditTask,
    onDeleteTask
}) => {

    return (
        <div
            className="w-80 flex-shrink-0 h-full flex flex-col"
            draggable
            onDragStart={(e) => onColumnDragStart(e, column.id)}
            onDragOver={onColumnDragOver}
            onDrop={(e) => onColumnDrop(e, column.id)}
        >
            {/* Column Header */}
            <div className={`p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between ${column.colorClass} bg-slate-100 dark:bg-slate-800/80 rounded-t-xl cursor-grab active:cursor-grabbing transition-colors`}>
                <div className='flex items-center space-x-2'>
                    <GripHorizontal size={14} className="opacity-50" />
                    <h3 className={`font-bold`}>{column.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full transition-colors">{tasks.length}</span>
                    <button onClick={(e) => { e.stopPropagation(); onEditColumn(column); }} className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteColumn(column.id) }} className="text-slate-500 dark:text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Column Body */}
            <div
                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-x border-b border-slate-200 dark:border-slate-700/50 rounded-b-xl p-3 overflow-y-auto space-y-3 custom-scrollbar transition-colors"
                onDragOver={onTaskDragOver}
                onDrop={(e) => onTaskDropOnColumn(e, column.id)}
            >
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        status={column.id}
                        onEdit={() => onEditTask(task)}
                        onDelete={onDeleteTask}
                        onDragStart={onTaskDragStart}
                        onDragOver={onTaskDragOver}
                        onDrop={onTaskDropOnCard}
                    />
                ))}

                <button
                    type="button"
                    onClick={() => onEditTask(undefined, column.id)}
                    className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all flex items-center justify-center text-sm font-medium"
                >
                    <Plus size={16} className="mr-2" /> Adicionar Card
                </button>
            </div>
        </div>
    );
};
