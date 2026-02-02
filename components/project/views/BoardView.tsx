import React, { useState } from 'react';
import { Project, Task, TaskStatus, Column } from '../../../types';
import { storageService } from '../../../services/storageService';
import { KanbanColumn } from '../../kanban/KanbanColumn';
import { FolderPlus } from 'lucide-react';

interface BoardViewProps {
    project: Project;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onEditColumn: (column: Column) => void;
    onDeleteColumn: (columnId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
    project,
    onEditTask,
    onDeleteTask,
    onEditColumn,
    onDeleteColumn
}) => {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

    // Helpers
    const getEffectiveColumns = (): Column[] => {
        if (project.columns && project.columns.length > 0) {
            return [...project.columns].sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        // Fallback default columns
        return [
            { id: 'TODO', title: 'A Fazer', colorClass: 'text-pink-400', order: 0 },
            { id: 'DOING', title: 'Em Progresso', colorClass: 'text-amber-400', order: 1 },
            { id: 'DONE', title: 'Concluído', colorClass: 'text-emerald-400', order: 2 }
        ];
    };

    // --- Drag and Drop Logic (Copied/Adapted from Kanban.tsx) ---

    // Columns
    const handleColumnDragStart = (e: React.DragEvent, colId: string) => {
        setDraggedColumnId(colId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleColumnDrop = async (e: React.DragEvent, targetColId: string) => {
        e.preventDefault();
        if (!draggedColumnId || draggedColumnId === targetColId) return;

        const columns = [...getEffectiveColumns()];
        const dragIdx = columns.findIndex(c => c.id === draggedColumnId);
        const targetIdx = columns.findIndex(c => c.id === targetColId);

        if (dragIdx === -1 || targetIdx === -1) return;

        const [movedCol] = columns.splice(dragIdx, 1);
        columns.splice(targetIdx, 0, movedCol);
        columns.forEach((c, idx) => c.order = idx);

        setDraggedColumnId(null);
        await storageService.updateProject({ ...project, columns });
    };

    // Tasks
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
        if (!draggedTaskId) return;

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

        if (!draggedTaskId || draggedTaskId === targetTaskId) return;

        const tasksCopy = [...project.tasks];
        const draggedIndex = tasksCopy.findIndex(t => t.id === draggedTaskId);
        const targetIndex = tasksCopy.findIndex(t => t.id === targetTaskId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [movedTask] = tasksCopy.splice(draggedIndex, 1);
        movedTask.status = targetStatus;

        // Simplified reordering insertion
        // Since we are not strictly ordering tasks within columns in the data model yet (just by array order),
        // we just put it in the new position.
        const newTargetIndex = tasksCopy.findIndex(t => t.id === targetTaskId);
        tasksCopy.splice(newTargetIndex, 0, movedTask);

        await storageService.updateProject({ ...project, tasks: tasksCopy });
        setDraggedTaskId(null);
    };

    return (
        <div className="flex-1 overflow-x-auto min-h-0 custom-scrollbar pb-4 p-6">
            <div className="flex space-x-6 h-full min-w-max">
                {getEffectiveColumns().map(col => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        tasks={project.tasks.filter(t => t.status === col.id)}
                        activeProjectId={project.id}
                        onEditColumn={onEditColumn}
                        onDeleteColumn={onDeleteColumn}
                        onColumnDragStart={handleColumnDragStart}
                        onColumnDrop={handleColumnDrop}
                        onColumnDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onTaskDragStart={handleTaskDragStart}
                        onTaskDragOver={handleTaskDragOver}
                        onTaskDropOnColumn={handleTaskDropOnColumn}
                        onTaskDropOnCard={handleTaskDropOnCard}
                        onEditTask={(task) => onEditTask(task)} // Wrap to match signature
                        onDeleteTask={onDeleteTask}
                    />
                ))}

                {/* Add Column Button Placeholder if needed, or handled via header actions */}
            </div>
        </div>
    );
};
