import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, AlertTriangle, Loader2, Copy, Trash2, Paperclip, Check } from 'lucide-react';
import type { User, ChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { askOpenAI } from '../services/openaiService';
import ChatInput from './chat/ChatInput';
import { MessageBubble } from './chat/MessageBubble';

interface ChatProps {
    currentUser: User;
    companyId: string;
    projectId?: string; // 'global' if undefined
    title?: string;
    isEmbedded?: boolean; // If true, renders with a close button and slightly different layout
    isAiOnly?: boolean; // If true, all messages trigger AI response without @chat
    onClose?: () => void;
    initialTargetId?: string;
}

const Chat: React.FC<ChatProps> = ({
    currentUser,
    companyId,
    projectId = 'global',
    title = 'Chat da Equipe',
    isEmbedded = false,
    isAiOnly = false,
    onClose,
    initialTargetId
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [attachment, setAttachment] = useState<{ file?: File, url: string, type: 'image' | 'video' } | null>(null);
    const [indexErrorLink, setIndexErrorLink] = useState<string | null>(null);
    const [isIndexBuilding, setIsIndexBuilding] = useState(false);

    // Interaction States
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string, isMe: boolean } | null>(null);

    // Selection mode states
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

    // Lightbox State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Users for Mentions
    const [users, setUsers] = useState<User[]>([]);

    // Legacy Avatar Support for old messages
    const [knownAvatars, setKnownAvatars] = useState<Record<string, string>>({});
    const knownAvatarsRef = useRef<Record<string, string>>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Initial Scroll / Highlight logic
    useEffect(() => {
        if (initialTargetId && messages.length > 0) {
            setTimeout(() => {
                const element = document.getElementById(`msg-${initialTargetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30', 'transition-colors', 'duration-1000');
                    setTimeout(() => {
                        element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
                    }, 2000);
                }
            }, 500);
        } else if (!initialTargetId && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, initialTargetId]);

    const scrollToBottom = () => {
        if (!initialTargetId) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        setIndexErrorLink(null);
        setIsIndexBuilding(false);
        setEditingMessageId(null);
        setReplyToMessage(null);

        if (!companyId) return;

        const unsubscribe = storageService.subscribeChat(companyId, projectId, (msgs) => {
            setMessages(msgs);
            setIndexErrorLink(null);
            setIsIndexBuilding(false);
        }, (error: any) => {
            if (error.message && error.message.includes('requires an index')) {
                const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
                if (urlMatch) {
                    setIndexErrorLink(urlMatch[0]);
                }
                if (error.message.includes('building')) {
                    setIsIndexBuilding(true);
                }
            }
        });
        return () => unsubscribe();
    }, [projectId, companyId]);

    // Fetch Users for Mentions
    useEffect(() => {
        if (!companyId) return;
        const unsubscribe = storageService.subscribeCompanyUsers(companyId, (fetchedUsers) => {
            setUsers(fetchedUsers);
        });
        return () => unsubscribe();
    }, [companyId]);

    // Robust Avatar Loading for Legacy Messages
    useEffect(() => {
        const fetchMissingAvatars = async () => {
            const missingUserIds = new Set<string>();
            messages.forEach(msg => {
                if (msg.userId !== currentUser.id && !msg.isAi && !msg.userAvatar && !knownAvatarsRef.current[msg.userId]) {
                    missingUserIds.add(msg.userId);
                }
            });

            if (missingUserIds.size > 0) {
                const newAvatars: Record<string, string> = {};
                await Promise.all(Array.from(missingUserIds).map(async (uid) => {
                    knownAvatarsRef.current[uid] = '';
                    try {
                        const user = await storageService.getUser(uid);
                        if (user && user.avatar) {
                            newAvatars[uid] = user.avatar;
                            knownAvatarsRef.current[uid] = user.avatar;
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch avatar for ${uid}`, err);
                    }
                }));
                if (Object.keys(newAvatars).length > 0) {
                    setKnownAvatars(prev => ({ ...prev, ...newAvatars }));
                }
            }
        };
        fetchMissingAvatars();
    }, [messages, currentUser.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1080;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    }, 'image/jpeg', 0.7);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const processFile = async (file: File) => {
        if (file.size > 50 * 1024 * 1024) {
            alert("O arquivo é muito grande (máx 50MB).");
            return;
        }

        let fileToProcess = file;
        if (file.type.startsWith('image') && file.size > 1024 * 1024) {
            try {
                fileToProcess = await compressImage(file);
            } catch (error) {
                console.error("Image compression failed, using original:", error);
            }
        }

        const type = fileToProcess.type.startsWith('video') ? 'video' : 'image';
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachment({
                file: fileToProcess,
                url: reader.result as string,
                type: type
            });
        };
        reader.readAsDataURL(fileToProcess);
    };

    // Selection mode functions
    const enterSelectionMode = (messageId?: string) => {
        setSelectionMode(true);
        if (messageId) setSelectedMessages(new Set([messageId]));
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedMessages(new Set());
    };

    const toggleMessageSelection = (messageId: string) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) newSet.delete(messageId);
            else newSet.add(messageId);
            return newSet;
        });
    };

    const deleteSelectedMessages = async () => {
        if (selectedMessages.size === 0) return;
        try {
            for (const msgId of selectedMessages) {
                await storageService.deleteChatMessage(msgId);
            }
            exitSelectionMode();
        } catch (error) {
            console.error('Error deleting messages:', error);
        }
    };

    const copySelectedMessages = () => {
        if (selectedMessages.size === 0) return;
        const selectedMsgs = messages
            .filter(msg => selectedMessages.has(msg.id))
            .map(msg => `${msg.username}: ${msg.text}`)
            .join('\n\n');
        navigator.clipboard.writeText(selectedMsgs);
        exitSelectionMode();
    };

    const handleSendMessage = async (text: string) => {
        if (editingMessageId) {
            const msgToUpdate = messages.find(m => m.id === editingMessageId);
            if (msgToUpdate) {
                try {
                    await storageService.updateChatMessage({
                        ...msgToUpdate,
                        text: text,
                        isEdited: true
                    });
                } catch (error) {
                    console.error("Error updating message:", error);
                    alert("Erro ao editar mensagem.");
                }
            }
            setEditingMessageId(null);
            setAttachment(null);
            return;
        }

        try {
            let uploadedMediaUrl: string | undefined = undefined;
            if (attachment?.url) {
                if (attachment.url.length > 950 * 1024) {
                    alert("A imagem comprimida ainda é muito grande para salvar diretamente no banco. Tente uma imagem mais simples.");
                    return;
                }
                uploadedMediaUrl = attachment.url;
            }

            const userMsg: ChatMessage = {
                id: '',
                userId: currentUser.id,
                username: currentUser.username,
                text: text,
                timestamp: Date.now(),
                mediaUrl: uploadedMediaUrl,
                mediaType: attachment?.type,
                companyId: companyId,
                projectId: projectId,
                replyTo: replyToMessage ? {
                    id: replyToMessage.id,
                    username: replyToMessage.username,
                    text: replyToMessage.text.substring(0, 50) + (replyToMessage.text.length > 50 ? '...' : '')
                } : undefined,
                userAvatar: currentUser.avatar
            };

            const savedMsgId = await storageService.saveChatMessage(userMsg);

            // Notifications
            const lowerInput = text.toLowerCase();
            const mentionedUsers = users.filter(u => lowerInput.includes(`@${u.username.toLowerCase()}`));
            const usersToNotify = new Map<string, 'MENTION' | 'MESSAGE'>();

            users.forEach(u => {
                if (u.id !== currentUser.id) {
                    if (!usersToNotify.has(u.id)) usersToNotify.set(u.id, 'MESSAGE');
                }
            });
            mentionedUsers.forEach(u => {
                if (u.id !== currentUser.id) usersToNotify.set(u.id, 'MENTION');
            });

            usersToNotify.forEach(async (type, targetUserId) => {
                const targetUser = users.find(u => u.id === targetUserId);
                if (!targetUser) return;
                const noteTitle = type === 'MENTION' ? `Nova menção de ${currentUser.username}` : `Nova mensagem em ${title}`;
                const noteMessage = type === 'MENTION' ? text : `${currentUser.username}: ${text}`;

                await storageService.createNotification({
                    id: '',
                    userId: targetUser.id,
                    type: type,
                    title: noteTitle,
                    message: noteMessage,
                    projectId: projectId,
                    projectName: title,
                    createdAt: Date.now(),
                    read: false,
                    targetId: savedMsgId
                });
            });

            setAttachment(null);
            setReplyToMessage(null);

            if (isAiOnly || text.toLowerCase().startsWith('@chat')) {
                triggerAiResponse(text);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Erro ao enviar mensagem.");
        }
    };

    const triggerAiResponse = async (currentInput: string) => {
        setIsAiThinking(true);
        const prompt = isAiOnly ? currentInput.trim() : currentInput.replace('@chat', '').trim();
        const context = projectId === 'global'
            ? `Você está no Chat Global da Equipe. Usuário: ${currentUser.username}.`
            : `Você está no Chat do Projeto "${title}". Usuário: ${currentUser.username}.`;

        try {
            const aiResponseText = await askOpenAI(prompt, context, companyId);
            const aiMsg: ChatMessage = {
                id: '',
                userId: 'ai-chatgpt',
                username: 'ChatGPT',
                text: aiResponseText,
                timestamp: Date.now() + 1,
                mediaUrl: undefined,
                mediaType: undefined,
                isAi: true,
                companyId: companyId,
                projectId: projectId,
                userAvatar: ''
            };
            const savedAiMsgId = await storageService.saveChatMessage(aiMsg);

            if (projectId === 'global') {
                const recipients = users.length > 0 ? users : [currentUser];
                recipients.forEach(async (u) => {
                    await storageService.createNotification({
                        id: '',
                        userId: u.id,
                        type: 'MESSAGE',
                        title: 'PartnerSync AI (Chat)',
                        message: aiResponseText,
                        projectId: projectId,
                        projectName: 'ChatGPT',
                        createdAt: Date.now(),
                        read: false,
                        targetId: savedAiMsgId
                    });
                });
            }
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, msg: ChatMessage) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO') return;
        e.preventDefault();
        const isMe = msg.userId === currentUser.id;
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            msgId: msg.id,
            isMe
        });
    };

    const handleAction = async (action: 'delete' | 'edit' | 'star' | 'reply') => {
        if (!contextMenu) return;
        const { msgId } = contextMenu;
        setContextMenu(null);
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        try {
            if (action === 'delete') {
                await storageService.deleteChatMessage(msgId);
            } else if (action === 'star') {
                await storageService.updateChatMessage({ ...msg, isStarred: !msg.isStarred });
            } else if (action === 'edit') {
                setEditingMessageId(msgId);
            } else if (action === 'reply') {
                setReplyToMessage(msg);
            }
        } catch (error) {
            console.error("Error performing chat action:", error);
        }
    };

    // Drag and Drop
    const [isDragging, setIsDragging] = useState(false);
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    if (indexErrorLink) {
        return (
            <div className={`flex flex-col h-full bg-slate-900 ${isEmbedded ? 'border-l border-slate-700' : ''}`}>
                <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between shadow-sm">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    {isEmbedded && onClose && <button onClick={onClose}><X size={20} className="text-white" /></button>}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isIndexBuilding ? 'bg-indigo-500/20' : 'bg-amber-500/20'}`}>
                        {isIndexBuilding ? <Loader2 className="text-indigo-500 animate-spin" size={32} /> : <AlertTriangle className="text-amber-500" size={32} />}
                    </div>
                    <h3 className="text-xl font-bold text-white">{isIndexBuilding ? 'Criando Índice...' : 'Índice Ausente'}</h3>
                    <div className="text-center">
                        {!isIndexBuilding && <a href={indexErrorLink} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold">Criar Índice</a>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col h-full bg-white dark:bg-slate-900 ${isEmbedded ? 'border-l border-slate-200 dark:border-slate-700' : ''} relative transition-colors`}
            ref={chatContainerRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-indigo-500/20 backdrop-blur-sm border-2 border-dashed border-indigo-400 m-4 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="bg-slate-900 p-4 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
                        <Paperclip size={32} className="text-indigo-400 mb-2" />
                        <span className="text-white font-bold">Solte o arquivo aqui</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between shadow-sm flex-shrink-0 transition-colors">
                {selectionMode ? (
                    <>
                        <div className="flex items-center space-x-3">
                            <button onClick={exitSelectionMode} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <span className="text-slate-900 dark:text-white font-semibold transition-colors">
                                {selectedMessages.size} selecionada{selectedMessages.size !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={copySelectedMessages} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Copiar">
                                <Copy size={20} />
                            </button>
                            <button onClick={deleteSelectedMessages} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors" title="Deletar">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center min-w-0">
                            {projectId === 'global' ? <Bot className="mr-2 text-indigo-400 flex-shrink-0" /> : <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>}
                            <h2 className="font-bold text-slate-900 dark:text-white truncate transition-colors">{title}</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!isEmbedded && (
                                <div className="text-xs text-slate-700 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full flex items-center hidden md:flex transition-colors">
                                    <Sparkles size={12} className="mr-1 text-green-400" />
                                    <span className="text-indigo-600 dark:text-indigo-300 font-mono mx-1 transition-colors">@chat</span>
                                </div>
                            )}
                            {isEmbedded && onClose && (
                                <button type="button" onClick={onClose} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 transition-colors">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                        <Sparkles className="mb-2 opacity-50" />
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-xs">Clique com o botão direito na mensagem para opções.</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        currentUser={currentUser}
                        selectionMode={selectionMode}
                        selectedMessages={selectedMessages}
                        onToggleSelection={toggleMessageSelection}
                        onContextMenu={handleContextMenu}
                        onImageClick={setSelectedImage}
                        knownAvatars={knownAvatars}
                        users={users}
                    />
                ))}
                {isAiThinking && (
                    <div className="flex justify-start w-full animate-pulse">
                        <div className="ml-10 bg-slate-800 border border-indigo-500/30 px-4 py-3 rounded-2xl rounded-tl-none">
                            <span className="text-xs text-indigo-300 flex items-center">
                                <Sparkles size={12} className="mr-1 animate-spin" />
                                Pensando...
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Context Menu Overlay */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[45]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}></div>
                    <div className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[50] py-1 min-w-[150px] animate-fade-in" style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 160) }}>
                        <button onClick={() => { enterSelectionMode(contextMenu.msgId); setContextMenu(null); }} className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center">
                            <Check size={16} className="mr-2" /> Selecionar
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleAction('reply'); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center">
                            Responder
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleAction('star'); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center">
                            Favoritar
                        </button>
                        {contextMenu.isMe && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); handleAction('edit'); }} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center">
                                    Editar
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleAction('delete'); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center">
                                    Apagar
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2" onClick={() => setSelectedImage(null)}><X size={32} /></button>
                    <img src={selectedImage} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* Input Area */}
            <ChatInput
                onSendMessage={handleSendMessage}
                onFileSelect={processFile}
                attachment={attachment}
                onRemoveAttachment={() => setAttachment(null)}
                replyToMessage={replyToMessage}
                editingMessage={editingMessageId ? { id: editingMessageId, text: messages.find(m => m.id === editingMessageId)?.text || '' } : null}
                onCancelContext={() => { setEditingMessageId(null); setReplyToMessage(null); }}
                users={users}
                companyId={companyId}
                isEmbedded={isEmbedded}
            />
        </div>
    );
};

export default Chat;