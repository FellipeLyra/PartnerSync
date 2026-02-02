import React from 'react';
import { Bot, User as UserIcon, Check, Star, Sparkles } from 'lucide-react';
import type { User, ChatMessage } from '../../types';

interface MessageBubbleProps {
    msg: ChatMessage;
    currentUser: User;
    selectionMode: boolean;
    selectedMessages: Set<string>;
    onToggleSelection: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, msg: ChatMessage) => void;
    onImageClick: (url: string) => void;
    knownAvatars: Record<string, string>;
    users: User[]; // For mention highlighting
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    msg,
    currentUser,
    selectionMode,
    selectedMessages,
    onToggleSelection,
    onContextMenu,
    onImageClick,
    knownAvatars,
    users
}) => {
    const isMe = msg.userId === currentUser.id;
    const isAi = msg.isAi;

    let avatarDisplay;
    if (isAi) {
        avatarDisplay = <Bot size={16} />;
    } else if (isMe && currentUser.avatar) {
        avatarDisplay = <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />;
    } else if (msg.userAvatar) {
        avatarDisplay = <img src={msg.userAvatar} alt={msg.username} className="w-full h-full object-cover" />;
    } else if (knownAvatars[msg.userId]) {
        avatarDisplay = <img src={knownAvatars[msg.userId]} alt={msg.username} className="w-full h-full object-cover" />;
    } else {
        avatarDisplay = <UserIcon size={16} />;
    }

    return (
        <div
            id={`msg-${msg.id}`}
            className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[85%] items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Selection checkbox */}
                {selectionMode && (
                    <div
                        onClick={() => onToggleSelection(msg.id)}
                        className="flex-shrink-0 cursor-pointer mt-1"
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedMessages.has(msg.id)
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-slate-500 hover:border-indigo-400'
                            }`}>
                            {selectedMessages.has(msg.id) && (
                                <Check size={14} className="text-white" />
                            )}
                        </div>
                    </div>
                )}

                {/* Avatar */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden mt-1 ${isAi ? 'bg-indigo-600 text-white' : isMe ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-200'
                    } ${isMe ? 'ml-2' : 'mr-2'}`}>
                    {avatarDisplay}
                </div>

                {/* Bubble Container */}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors">{msg.username}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-600 transition-colors">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Reply Context */}
                    {msg.replyTo && (
                        <div className={`mb-1 px-3 py-2 rounded-lg text-xs border-l-4 opacity-80 ${isMe ? 'bg-emerald-900/50 border-emerald-400 text-emerald-100' : 'bg-slate-200 dark:bg-slate-800 border-indigo-400 text-slate-700 dark:text-slate-300'} transition-colors`}>
                            <p className="font-bold mb-0.5">{msg.replyTo.username}</p>
                            <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                        </div>
                    )}

                    <div
                        onContextMenu={(e) => onContextMenu(e, msg)}
                        className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-md whitespace-pre-wrap break-all cursor-pointer select-text transition-all ${isAi
                            ? 'bg-slate-100 dark:bg-slate-800 border border-indigo-500/30 text-slate-900 dark:text-indigo-100 rounded-tl-none'
                            : isMe
                                ? 'bg-emerald-600 text-white rounded-tr-none hover:bg-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none hover:bg-slate-300 dark:hover:bg-slate-600'
                            } ${msg.isStarred ? 'ring-2 ring-yellow-500/50' : ''}`}
                    >
                        {msg.isStarred && (
                            <Star size={10} className="absolute -top-1 -right-1 text-yellow-400 fill-yellow-400 bg-slate-900 rounded-full p-0.5 box-content" />
                        )}

                        {msg.mediaUrl && (
                            <div className="mb-2 mt-1 rounded-lg overflow-hidden max-w-full">
                                {msg.mediaType === 'video' ? (
                                    <video src={msg.mediaUrl} controls className="max-h-48 rounded-lg bg-black/50" />
                                ) : (
                                    <img
                                        src={msg.mediaUrl}
                                        alt="attachment"
                                        className="max-h-48 rounded-lg object-contain bg-black/20 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Avoid triggering message selection/context menu
                                            onImageClick(msg.mediaUrl!);
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {/* Message Text with Mention Highlighting */}
                        {msg.text && (
                            <p className="select-text">
                                {msg.text.split(/(@\w+)/g).map((part, i) => {
                                    if (part.startsWith('@')) {
                                        const username = part.substring(1);
                                        // Check if it's a valid user or 'chat'
                                        const isValidUser = users.some(u => u.username === username.toLowerCase()) || username.toLowerCase() === 'chat';
                                        if (isValidUser) {
                                            return (
                                                <span key={i} className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {part}
                                                </span>
                                            );
                                        }
                                    }
                                    return part;
                                })}
                            </p>
                        )}

                        {/* YouTube Embed */}
                        {(() => {
                            const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                            const match = msg.text?.match(youtubeRegex);
                            if (match) {
                                const videoId = match[1];
                                return (
                                    <div className="mt-2 rounded-lg overflow-hidden">
                                        <iframe
                                            width="100%"
                                            height="200"
                                            src={`https://www.youtube.com/embed/${videoId}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="rounded-lg"
                                        ></iframe>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {msg.isEdited && (
                            <span className="text-[10px] opacity-60 ml-1 italic align-bottom block text-right mt-1">(editado)</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
