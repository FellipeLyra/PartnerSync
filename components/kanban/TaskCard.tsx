import React from 'react';
import { Edit2, GripHorizontal, List, Video, Image as ImageIcon, Calendar, Trash2 } from 'lucide-react';
import { DEFAULT_STATUSES } from '../../types';
import type { Task, TaskPriority, TaskStatus } from '../../types';

interface TaskCardProps {
    task: Task;
    status: TaskStatus; // Current column status, needed for drop context
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetTaskId: string, targetStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
    task,
    status,
    onEdit,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop
}) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== DEFAULT_STATUSES.DONE;

    const getPriorityColor = (p: TaskPriority) => {
        switch (p) {
            case 'URGENT': return 'bg-purple-500 text-white border-purple-400';
            case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div
            onDrop={(e) => { e.stopPropagation(); onDrop(e, task.id, status); }}
            onDragOver={onDragOver}
            onClick={() => onEdit(task)}
            className="bg-white dark:bg-slate-700 p-4 pt-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group hover:shadow-lg relative cursor-default mb-3"
        >
            {/* DRAG HANDLE */}
            <div
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 right-0 top-0 h-6 cursor-grab active:cursor-grabbing rounded-t-lg z-10 flex items-center justify-center hover:bg-white/5 transition-colors group-hover:opacity-100 opacity-0"
                title="Arrastar Card"
            >
                <GripHorizontal size={14} className="text-slate-500" />
            </div>

            {/* Priority Badge & Edit */}
            <div className="flex justify-between items-start mb-2 relative z-20">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'URGENT' ? 'URGENTE' : task.priority === 'HIGH' ? 'ALTA' : task.priority === 'MEDIUM' ? 'MÉDIA' : 'BAIXA'}
                </span>
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                    className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors bg-slate-100 dark:bg-slate-700/50"
                    title="Editar"
                >
                    <Edit2 size={14} />
                </button>
            </div>

            <p className="text-slate-900 dark:text-slate-200 font-medium text-sm mb-2 mt-1 transition-colors">{task.content}</p>

            {/* Visual Indicators */}
            <div className="flex flex-wrap gap-2 mb-2">
                {task.description && <div title="Possui descrição"><List size={14} className="text-slate-400" /></div>}
                {task.mediaUrl && (
                    task.mediaUrl.match(/\.(mp4|webm)$/i)
                        ? <div title="Vídeo anexado"><Video size={14} className="text-pink-400" /></div>
                        : <div title="Imagem anexada"><ImageIcon size={14} className="text-pink-400" /></div>
                )}
            </div>

            {/* Media Preview (Small) */}
            {task.mediaUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 max-h-32 transition-colors">
                    {task.mediaUrl.match(/\.(mp4|webm)$/i) ? (
                        <video src={task.mediaUrl} className="w-full h-full object-cover opacity-80" muted />
                    ) : (
                        <img src={task.mediaUrl} alt="attachment" className="w-full h-full object-cover opacity-80" />
                    )}
                </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600/50 relative z-20 transition-colors">
                <div className={`flex items-center text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-600 dark:text-slate-400'} transition-colors`}>
                    <Calendar size={12} className="mr-1" />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                </div>

                <button
                    type="button"
                    className="text-slate-500 dark:text-slate-500 hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-600/50 p-1.5 rounded transition-colors cursor-pointer"
                    onMouseDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete(task.id);
                    }}
                    title="Excluir Tarefa"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
};
