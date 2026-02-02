import { Clock, Calendar, AlertCircle, Circle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { Task, TaskPriority, User, DEFAULT_STATUSES } from '../../../types';

interface ListViewProps {
    tasks: Task[];
    users: User[];
    onTaskClick: (task: Task) => void;
    onStatusChange: (taskId: string, newStatus: string) => void;
}

const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const colors = {
        LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    const labels = {
        LOW: 'Baixa',
        MEDIUM: 'Média',
        HIGH: 'Alta',
        URGENT: 'Urgente'
    };

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${colors[priority] || colors.MEDIUM}`}>
            {labels[priority] || priority}
        </span>
    );
};

export const ListView: React.FC<ListViewProps> = ({ tasks, users, onTaskClick, onStatusChange }) => {

    // Helper to group tasks
    const groupTasks = () => {
        const groups = {
            overdue: [] as Task[],
            today: [] as Task[],
            upcoming: [] as Task[],
            noDate: [] as Task[]
        };

        const now = new Date();
        const todayStr = new Date().toLocaleDateString('en-CA');

        tasks.forEach(task => {
            if (task.status === DEFAULT_STATUSES.DONE) return; // Don't show done tasks in main list usually, or maybe in a separate section?

            if (!task.dueDate) {
                groups.noDate.push(task);
                return;
            }

            const dueDate = new Date(task.dueDate);
            const dueStr = dueDate.toISOString().split('T')[0];

            if (dueStr < todayStr) {
                groups.overdue.push(task);
            } else if (dueStr === todayStr) {
                groups.today.push(task);
            } else {
                groups.upcoming.push(task);
            }
        });

        return groups;
    };

    const groups = groupTasks();

    const renderTaskRow = (task: Task) => (
        <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="group flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl mb-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
            {/* Status Checkbox */}
            <div className="mr-4" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onStatusChange(task.id, DEFAULT_STATUSES.DONE)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                >
                    <Circle size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {task.content}
                </h4>
                {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{task.description}</p>
                )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 ml-4 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                {/* Labels/Tags (Placeholder for now as existing tasks might not have tags structure fully defined, using priority) */}
                <PriorityBadge priority={task.priority} />

                {/* Due Date */}
                <div className={`flex items-center ${task.dueDate && task.dueDate < new Date().toLocaleDateString('en-CA') ? 'text-red-500' : ''}`}>
                    <Calendar size={14} className="mr-1.5" />
                    <span>{task.dueDate ? new Date(task.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Sem data'}</span>
                </div>

                <div className="flex -space-x-2">
                    {(() => {
                        if (!task.assignee) {
                            return (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500" title="Sem responsável">
                                    <UserIcon size={12} />
                                </div>
                            );
                        }
                        const user = users.find(u => u.id === task.assignee);
                        if (user) {
                            return (
                                <div key={user.id} className="relative group/avatar" title={user.username}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-500 flex items-center justify-center text-[10px] text-white uppercase font-bold">
                                            {user.username.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Comments Count */}
                <div className="flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded text-[10px]">0</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Overdue */}
            {groups.overdue.length > 0 && (
                <section>
                    <h3 className="flex items-center text-sm font-bold text-red-500 mb-4 uppercase tracking-wider">
                        <AlertCircle size={16} className="mr-2" />
                        Atrasado <span className="ml-2 text-xs font-normal text-slate-500">{groups.overdue.length} itens</span>
                    </h3>
                    <div className="space-y-1">
                        {groups.overdue.map(renderTaskRow)}
                    </div>
                </section>
            )}

            {/* Today */}
            <section>
                <h3 className="flex items-center text-sm font-bold text-amber-500 mb-4 uppercase tracking-wider">
                    <Clock size={16} className="mr-2" />
                    Hoje <span className="ml-2 text-xs font-normal text-slate-500">{groups.today.length} itens</span>
                </h3>
                {groups.today.length === 0 && <p className="text-sm text-slate-400 italic mb-4">Nenhuma tarefa para hoje.</p>}
                <div className="space-y-1">
                    {groups.today.map(renderTaskRow)}
                </div>
            </section>

            {/* Upcoming */}
            {groups.upcoming.length > 0 && (
                <section>
                    <h3 className="flex items-center text-sm font-bold text-indigo-500 mb-4 uppercase tracking-wider">
                        <Calendar size={16} className="mr-2" />
                        Próximas <span className="ml-2 text-xs font-normal text-slate-500">{groups.upcoming.length} itens</span>
                    </h3>
                    <div className="space-y-1">
                        {groups.upcoming.map(renderTaskRow)}
                    </div>
                </section>
            )}

            {/* No Date */}
            {groups.noDate.length > 0 && (
                <section>
                    <h3 className="flex items-center text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">
                        Sem Data <span className="ml-2 text-xs font-normal text-slate-400">{groups.noDate.length} itens</span>
                    </h3>
                    <div className="space-y-1">
                        {groups.noDate.map(renderTaskRow)}
                    </div>
                </section>
            )}
        </div>
    );
};
