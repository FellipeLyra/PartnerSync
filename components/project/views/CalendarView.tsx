import React from 'react';
import { Task, User } from '../../../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
    tasks: Task[];
    users: User[];
    onTaskClick: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, users, onTaskClick }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Auto-navigate to task if only one exists or if filtered
    React.useEffect(() => {
        if (tasks.length > 0) {
            // Check if any task is in the current view
            const currentMonthStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
            const hasVisibleTasks = tasks.some(t => t.dueDate && t.dueDate.startsWith(currentMonthStr));

            if (!hasVisibleTasks) {
                // Find the first task with a date
                const firstTaskWithDate = tasks.find(t => t.dueDate);
                if (firstTaskWithDate && firstTaskWithDate.dueDate) {
                    // Jump to that date
                    const [y, m, d] = firstTaskWithDate.dueDate.split('-').map(Number);
                    if (!isNaN(y) && !isNaN(m)) {
                        setCurrentDate(new Date(y, m - 1, 1));
                    }
                }
            }
        }
    }, [tasks]); // Run when tasks list changes (e.g. filter change)

    const daysInMonth = getDaysInMonth(currentDate);
    const startDayOffset = getFirstDayOfMonth(currentDate);

    // Formatting: "Janeiro 2026"
    const monthYearString = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    // Capitalize first letter
    const formattedTitle = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

    const renderDays = () => {
        const slots = [];
        // Empty slots for start offset
        for (let i = 0; i < startDayOffset; i++) {
            slots.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            // Construct date string YYYY-MM-DD
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = d.toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            slots.push(
                <div key={d} className={`min-h-[120px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 overflow-y-auto ${isToday ? 'bg-indigo-50/10' : ''}`}>
                    <div className={`text-right text-xs font-bold mb-1 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                        {isToday ? <span className="bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded-full">{d}</span> : d}
                    </div>
                    <div className="space-y-1">
                        {dayTasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                className={`text-[10px] p-1 rounded border truncate cursor-pointer hover:opacity-80
                                    ${task.priority === 'URGENT' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800' :
                                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800' :
                                            'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800'}
                                `}
                                title={task.content}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate flex-1">{task.content}</span>
                                    {task.assignee && (() => {
                                        const user = users.find(u => u.id === task.assignee);
                                        return user ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                className="w-4 h-4 rounded-full border border-white dark:border-slate-800 ml-1 flex-shrink-0"
                                                title={user.username}
                                            />
                                        ) : null;
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{formattedTitle}</h2>
                <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronLeft size={20} /></button>
                    <button onClick={handleToday} className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">Hoje</button>
                    <button onClick={handleNextMonth} className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="grid grid-cols-7 gap-px">
                    {days.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                            {day}
                        </div>
                    ))}
                    {renderDays()}
                </div>
            </div>
        </div>
    );
};
