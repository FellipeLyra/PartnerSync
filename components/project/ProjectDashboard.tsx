import React, { useState, useEffect } from 'react';
import { DEFAULT_STATUSES } from '../../types';
import type { Project, Task, User, TaskStatus, Column } from '../../types';
import { storageService } from '../../services/storageService';
import { ProjectSidebar } from './ProjectSidebar';
import { ProjectHeader } from './ProjectHeader';
import { ListView } from './views/ListView';
import { BoardView } from './views/BoardView';
import { CalendarView } from './views/CalendarView';
import { TaskModal } from '../kanban/TaskModal';
import { Plus } from 'lucide-react';

interface ProjectDashboardProps {
    currentUser: User;
    companyId: string;
    initialProjectId?: string;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ currentUser, companyId, initialProjectId }) => {
    // State
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string>('');
    const [currentView, setCurrentView] = useState<'LIST' | 'BOARD' | 'CALENDAR'>('LIST');

    // Filters
    const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(DEFAULT_STATUSES.TODO);

    // Data Fetching
    useEffect(() => {
        if (!companyId) return;

        // Fetch Users for assignment/display
        const unsubUsers = storageService.subscribeCompanyUsers(companyId, setUsers);

        // Fetch Projects
        const unsubProjects = storageService.subscribeProjects(companyId, (loadedProjects) => {
            const visibleProjects = loadedProjects.filter(p => {
                if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') return true;
                if (!currentUser.permissions?.allowedProjectIds) return true;
                return currentUser.permissions.allowedProjectIds.includes(p.id);
            });
            setProjects(visibleProjects);

            // Set Active Project logic
            setActiveProjectId(current => {
                if (current && visibleProjects.some(p => p.id === current)) return current;
                if (initialProjectId && visibleProjects.some(p => p.id === initialProjectId)) return initialProjectId;
                // Default to Global View (All Tasks) instead of first project
                return '';
            });
        });

        return () => {
            unsubUsers();
            unsubProjects();
        };
    }, [companyId, currentUser, initialProjectId]);


    // Computed Data
    const activeProject = projects.find(p => p.id === activeProjectId);

    // Aggregated Stats for Sidebar
    const getAllTasks = () => projects.flatMap(p => p.tasks);
    const todayStr = new Date().toLocaleDateString('en-CA');

    const taskStats = {
        total: getAllTasks().length,
        completed: getAllTasks().filter(t => t.status === DEFAULT_STATUSES.DONE).length,
        overdue: getAllTasks().filter(t => t.dueDate && t.dueDate < todayStr && t.status !== DEFAULT_STATUSES.DONE).length
    };

    // Filter Logic
    const getFilteredTasks = () => {
        let tasks = activeProject ? activeProject.tasks : [];
        if (filter === 'ALL' && !activeProject) {
            // If "All Tasks" selected (conceptually) or just showing aggregate, 
            // for now we stick to "Active Project" context mostly, OR aggregating everything if 'ALL' global filter?
            // The design image implies "8 tarefas", likely specific to selection or global.
            // Let's support global if no project selected or special "ALL" mode, but Sidebar usually selects a project.
            // If we want "All Tasks across all projects", we need a virtual "All" project selection.
            // For simplicity, we filter the *Active Project* tasks.
            // BUT, if the user clicked "Hoje" in sidebar, they might expect Today's tasks from ALL projects.
        }

        // Logic: specific Filter overrides project selection? 
        // Or Filter is just a filter ON TOP of project?
        // "Todas", "Hoje", "Próximas", "Atrasadas" in Sidebar look like Global filters or Quick filters.
        // Let's assume they are GLOBAL filters if they are clicked, effectively unselecting a specific project visually, 
        // OR we just filter the CURRENT project.
        // Given the sidebar structure (Main Filters separate from Projects), they likely apply Globally or to "My Tasks".
        // Let's try Global for these filters, and Specific Project for Project list.

        let sourceTasks = (activeProject && filter === 'ALL') ? activeProject.tasks : getAllTasks();

        // If a project is explicitly selected in the sidebar UI (we track this), we show that project's tasks.
        // If a Filter is selected, we show tasks matching that filter from ALL projects (or Active Project? Design is ambiguous, assuming Global for "My Work").

        // Let's simplify: 
        // If `activeProjectId` is set, we show that Project.
        // But `filter` state might imply "All Projects Today".

        // Let's refine state:
        // Sidebar has `onSelectProject` and `onSelectFilter`.
        // If `onSelectProject` is called, we set `activeProjectId` and set `filter` to 'ALL'.
        // If `onSelectFilter` is called, we set `activeProjectId` to '' (empty) to indicate "Global View" and set `filter`.

        if (activeProjectId) {
            sourceTasks = activeProject ? activeProject.tasks : [];
        } else {
            sourceTasks = getAllTasks();
        }

        // Apply Time Filters
        const todayStr = new Date().toLocaleDateString('en-CA');

        if (filter === 'TODAY') {
            sourceTasks = sourceTasks.filter(t => t.dueDate && t.dueDate.startsWith(todayStr));
        } else if (filter === 'UPCOMING') {
            const nextWeek = new Date();
            nextWeek.setDate(new Date().getDate() + 7);
            const nextWeekStr = nextWeek.toLocaleDateString('en-CA');
            sourceTasks = sourceTasks.filter(t => t.dueDate && t.dueDate > todayStr && t.dueDate <= nextWeekStr);
        } else if (filter === 'OVERDUE') {
            sourceTasks = sourceTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== DEFAULT_STATUSES.DONE);
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            sourceTasks = sourceTasks.filter(t => t.content.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
        }

        return sourceTasks;
    };

    const filteredTasks = getFilteredTasks();


    // Handlers
    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
        setNewTaskStatus(task.status);
        setShowTaskModal(true);
    };

    const handleNewTask = () => {
        setEditingTask(null);
        setNewTaskStatus(DEFAULT_STATUSES.TODO);
        setShowTaskModal(true);
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        // We need a target project. If activeProjectId is set, use it.
        // If global view, maybe ask user to select project? Or default to first?
        const targetProjectId = activeProjectId || (projects.length > 0 ? projects[0].id : null);

        if (!targetProjectId) {
            alert("Crie um projeto primeiro.");
            return;
        }

        const project = projects.find(p => p.id === targetProjectId);
        if (!project) return;

        let updatedTasks = [...project.tasks];

        if (editingTask) {
            // Find which project the task actually belongs to (might not be activeProject in Global view)
            const originalProject = projects.find(p => p.tasks.some(t => t.id === editingTask.id));
            if (originalProject) {
                const pTasks = [...originalProject.tasks];
                const tIndex = pTasks.findIndex(t => t.id === editingTask.id);
                if (tIndex > -1) {
                    pTasks[tIndex] = { ...pTasks[tIndex], ...taskData };
                    await storageService.updateProject({ ...originalProject, tasks: pTasks });
                }
            }
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
            await storageService.updateProject({ ...project, tasks: updatedTasks });
        }
        setShowTaskModal(false);
    };

    const handleDeleteTask = async (taskId: string) => {
        // Find project for task
        const project = projects.find(p => p.tasks.some(t => t.id === taskId));
        if (project) {
            const newTasks = project.tasks.filter(t => t.id !== taskId);
            await storageService.updateProject({ ...project, tasks: newTasks });
        }
        setShowTaskModal(false);
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        const project = projects.find(p => p.tasks.some(t => t.id === taskId));
        if (project) {
            const task = project.tasks.find(t => t.id === taskId);
            if (task) {
                const newTasks = project.tasks.map(t => t.id === taskId ? { ...t, status: newStatus as TaskStatus } : t);
                await storageService.updateProject({ ...project, tasks: newTasks });
            }
        }
    };

    const handlePageTitle = () => {
        if (activeProjectId && activeProject) return activeProject.name;
        if (filter === 'TODAY') return 'Tarefas de Hoje';
        if (filter === 'UPCOMING') return 'Próximas Tarefas';
        if (filter === 'OVERDUE') return 'Tarefas Atrasadas';
        return 'Todas as Tarefas';
    };

    return (
        <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden">
            {/* Sidebar */}
            <ProjectSidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={(id) => { setActiveProjectId(id); setFilter('ALL'); }}
                currentFilter={filter}
                onSelectFilter={(f) => { setFilter(f); setActiveProjectId(''); }}
                taskStats={taskStats}
            />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <ProjectHeader
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    title={handlePageTitle()}
                />

                <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-900/50">
                    {/* View Rendering */}
                    {activeProjectId === '' && filter === 'ALL' && projects.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <p>Nenhum projeto encontrado.</p>
                        </div>
                    ) : (
                        <>
                            {currentView === 'LIST' && (
                                <ListView
                                    tasks={filteredTasks}
                                    users={users}
                                    onTaskClick={handleTaskClick}
                                    onStatusChange={handleStatusChange}
                                />
                            )}
                            {currentView === 'BOARD' && (
                                activeProject ? (
                                    <BoardView
                                        project={activeProject}
                                        onEditTask={handleTaskClick}
                                        onDeleteTask={handleDeleteTask}
                                        onEditColumn={() => { }} // TODO: Add column editing support back if needed
                                        onDeleteColumn={() => { }} // TODO: Add column deleting support back
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <p>Selecione um projeto específico para ver o Kanban.</p>
                                    </div>
                                )
                            )}
                            {currentView === 'CALENDAR' && (
                                <CalendarView tasks={filteredTasks} users={users} onTaskClick={handleTaskClick} />
                            )}
                        </>
                    )}

                    {/* FAB for New Task */}
                    <button
                        onClick={handleNewTask}
                        className="absolute bottom-6 right-24 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSave={handleSaveTask}
                initialTask={editingTask}
                defaultStatus={newTaskStatus}
                users={users}
                currentUser={currentUser}
            />
        </div>
    );
};
