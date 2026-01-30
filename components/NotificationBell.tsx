import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { User, AppNotification, ViewState } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';

interface NotificationBellProps {
    currentUser: User;
    onNavigate?: (view: ViewState, params?: any) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser, onNavigate }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const prevCountRef = useRef(0);

    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = storageService.subscribeNotifications(currentUser.id, (notes) => {
            setNotifications(notes);

            // Play sound if new notification arrived (and not initial load)
            if (notes.length > prevCountRef.current && prevCountRef.current > 0) {
                notificationService.playSound();
            }
            prevCountRef.current = notes.length;
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        await storageService.markNotificationAsRead(id);
    };

    const markAllAsRead = async () => {
        // Sequentially mark all visible as read
        for (const note of notifications) {
            await storageService.markNotificationAsRead(note.id);
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors relative"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-100 dark:border-slate-800"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 animate-fade-in origin-top-right overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-800 dark:text-white">Notificações</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Marcar todas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                <Bell className="mx-auto mb-2 opacity-20" size={32} />
                                <p className="text-sm">Nenhuma notificação nova</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {notifications.map((note) => (
                                    <div
                                        key={note.id}
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group relative"
                                        onClick={() => {
                                            markAsRead(note.id);
                                            if (onNavigate && (note.type === 'MESSAGE' || note.type === 'MENTION')) {
                                                if (note.projectId === 'global') {
                                                    // Global Chat -> Chat View
                                                    onNavigate('CHAT', {
                                                        projectId: 'global',
                                                        targetId: note.targetId
                                                    });
                                                } else {
                                                    // Project Chat -> Projects View
                                                    onNavigate('PROJECTS', {
                                                        projectId: note.projectId,
                                                        showChat: true,
                                                        targetId: note.targetId // Pass it just in case Kanban Chat supports it later
                                                    });
                                                }
                                                setIsOpen(false);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">
                                                    {note.type === 'MESSAGE' ? (
                                                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] mr-1">CHAT</span>
                                                    ) : (
                                                        <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px] mr-1">MENÇÃO</span>
                                                    )}
                                                    {note.projectName || 'Projeto'}
                                                </p>
                                                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-1">
                                                    {note.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {note.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-2">
                                                    {new Date(note.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => markAsRead(note.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-500 transition-all"
                                                title="Marcar como lida"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
