import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Paperclip, X, Image as ImageIcon, AlertTriangle, Loader2, MoreVertical, Star, Trash2, Edit2, Reply, Check, Copy } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { fileService } from '../services/fileService';
import { askOpenAI } from '../services/openaiService';
import { notificationService } from '../services/notificationService';

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
    const [inputValue, setInputValue] = useState('');
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

    // Mentions State
    const [users, setUsers] = useState<User[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionIndex, setMentionIndex] = useState(-1); // Index in filtered users for keyboard nav

    // Legacy Avatar Support for old messages
    const [knownAvatars, setKnownAvatars] = useState<Record<string, string>>({});
    const knownAvatarsRef = useRef<Record<string, string>>({}); // Ref to avoid useEffect dependency loops

    // Track previous messages for new message detection
    const previousMessagesRef = useRef<ChatMessage[]>([]);
    const currentUserRef = useRef(currentUser);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Update currentUserRef when currentUser changes
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // Initial Scroll / Highlight logic
    useEffect(() => {
        if (initialTargetId && messages.length > 0) {
            // Wait slightly for rendering
            setTimeout(() => {
                const element = document.getElementById(`msg-${initialTargetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional: Add highlight flash class
                    element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30', 'transition-colors', 'duration-1000');
                    setTimeout(() => {
                        element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
                    }, 2000);
                }
            }, 500);
        } else if (!initialTargetId && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, initialTargetId]); // Re-run when messages load or targetId changes

    const scrollToBottom = () => {
        // Only scroll if we are NOT targeting a specific past message
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
            console.log("[Chat] Users fetched:", fetchedUsers.length);
            setUsers(fetchedUsers);
        });
        return () => unsubscribe();
    }, [companyId]);

    // Robust Avatar Loading for Legacy Messages
    useEffect(() => {
        const fetchMissingAvatars = async () => {
            const missingUserIds = new Set<string>();

            messages.forEach(msg => {
                // If it's not me, not AI, has no attached avatar, and we don't know the avatar yet
                if (msg.userId !== currentUser.id &&
                    !msg.isAi &&
                    !msg.userAvatar &&
                    !knownAvatarsRef.current[msg.userId]) {
                    missingUserIds.add(msg.userId);
                }
            });

            if (missingUserIds.size > 0) {
                console.log("Fetching missing avatars for:", Array.from(missingUserIds));
                const newAvatars: Record<string, string> = {};

                // Fetch sequentially to be nice to Firestore (or use Promise.all)
                await Promise.all(Array.from(missingUserIds).map(async (uid) => {
                    // Mark as fetched (even if null) to avoid infinite loops
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle Input Change for Mentions
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Simple mention detection: last word starts with @
        const items = value.split(' ');
        const lastWord = items[items.length - 1];

        if (lastWord.startsWith('@')) {
            setShowMentions(true);
            setMentionQuery(lastWord.substring(1).toLowerCase());
            setMentionIndex(0);
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (username: string) => {
        const items = inputValue.split(' ');
        items.pop(); // Remove the partial @mention
        const newValue = [...items, `@${username} `].join(' ');
        setInputValue(newValue);
        setShowMentions(false);
        fileInputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Handle mention navigation
        if (showMentions) {
            const chatGPTUser: User = { id: 'chatgpt-bot', username: 'chat', email: 'ai@partnersync.com', avatar: '', companyId: companyId, role: 'MEMBER' };
            const suggestedUsers = [chatGPTUser, ...users].filter(u => u.username.toLowerCase().includes(mentionQuery));

            if (suggestedUsers.length > 0) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setMentionIndex(prev => (prev > 0 ? prev - 1 : suggestedUsers.length - 1));
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setMentionIndex(prev => (prev < suggestedUsers.length - 1 ? prev + 1 : 0));
                } else if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    if (mentionIndex >= 0 && mentionIndex < suggestedUsers.length) {
                        insertMention(suggestedUsers[mentionIndex].username);
                    }
                } else if (e.key === 'Escape') {
                    setShowMentions(false);
                }
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    processFile(file);
                    e.preventDefault(); // Prevent pasting the image binary as text
                }
            }
        }
    };

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

                    // Max dimensions (Full HD)
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

                    // Compress to JPEG 0.7 quality
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
        // Check real max limit (50MB) 
        // Note: We check before compression. Compression will reduce it further.
        if (file.size > 50 * 1024 * 1024) {
            alert("O arquivo é muito grande (máx 50MB).");
            return;
        }

        let fileToProcess = file;

        // Compress images if > 1MB
        if (file.type.startsWith('image') && file.size > 1024 * 1024) {
            try {
                fileToProcess = await compressImage(file);
                console.log(`Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(fileToProcess.size / 1024 / 1024).toFixed(2)}MB`);
            } catch (error) {
                console.error("Image compression failed, using original:", error);
            }
        }

        const type = fileToProcess.type.startsWith('video') ? 'video' : 'image';
        const reader = new FileReader();
        reader.onloadend = () => {
            setAttachment({
                file: fileToProcess, // Store the (potentially compressed) file
                url: reader.result as string, // Preview
                type: type
            });
        };
        reader.readAsDataURL(fileToProcess);
    };

    // Selection mode functions
    const enterSelectionMode = (messageId?: string) => {
        setSelectionMode(true);
        if (messageId) {
            setSelectedMessages(new Set([messageId]));
        }
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedMessages(new Set());
    };

    const toggleMessageSelection = (messageId: string) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    };

    const deleteSelectedMessages = async () => {
        if (selectedMessages.size === 0) return;

        try {
            // Delete each selected message
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

        // Get selected messages in order
        const selectedMsgs = messages
            .filter(msg => selectedMessages.has(msg.id))
            .map(msg => `${msg.username}: ${msg.text}`)
            .join('\n\n');

        navigator.clipboard.writeText(selectedMsgs);
        exitSelectionMode();
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !attachment) return;

        if (editingMessageId) {
            // Edit mode (no file changes supported here for simplicity)
            const msgToUpdate = messages.find(m => m.id === editingMessageId);
            if (msgToUpdate) {
                try {
                    await storageService.updateChatMessage({
                        ...msgToUpdate,
                        text: inputValue,
                        isEdited: true
                    });
                } catch (error) {
                    console.error("Error updating message:", error);
                    alert("Erro ao editar mensagem.");
                }
            }
            setEditingMessageId(null);
            setInputValue('');
            setAttachment(null);
            return;
        }

        try {
            // FALLBACK STRATEGY: Use Base64 directly (Bypass CORS/Storage)
            // Since we are compressing images, they should fit in Firestore (< 1MB)
            let uploadedMediaUrl: string | undefined = undefined;

            if (attachment?.url) {
                // Check if base64 string is too large for Firestore (approx 1MB limit = ~1.4M chars)
                // We leave a safety margin (900KB)
                if (attachment.url.length > 950 * 1024) {
                    alert("A imagem comprimida ainda é muito grande para salvar diretamente no banco. Tente uma imagem mais simples.");
                    return;
                }
                uploadedMediaUrl = attachment.url;
            }

            // Handle New Message
            const userMsg: ChatMessage = {
                id: '', // Auto-generated
                userId: currentUser.id,
                username: currentUser.username,
                text: inputValue,
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

            // --- NOTIFICATION LOGIC ---
            // 1. Identify valid mentions (case-insensitive check)
            const lowerInput = inputValue.toLowerCase();
            const mentionedUsers = users.filter(u => lowerInput.includes(`@${u.username.toLowerCase()}`));

            // 2. Identify who needs to be notified
            // Map of UserId -> Notification Type
            const usersToNotify = new Map<string, 'MENTION' | 'MESSAGE'>();

            // Team Chat & Project Chat: Notify everyone (except self)
            // TODO: In the future, filter by project members if needed.
            console.log("[Chat] Processing Chat Notifications. Project:", projectId, "Total Users:", users.length);

            // Normalize caching KEY logic if necessary, but here we just notify everyone
            users.forEach(u => {
                if (u.id !== currentUser.id) {
                    // Only add if not already mentioned (mentions take precedence)
                    if (!usersToNotify.has(u.id)) {
                        usersToNotify.set(u.id, 'MESSAGE');
                    }
                }
            });

            // Mentions always take precedence and are added for Project Chat too
            mentionedUsers.forEach(u => {
                if (u.id !== currentUser.id) {
                    usersToNotify.set(u.id, 'MENTION');
                }
            });

            // 3. Send Notifications
            usersToNotify.forEach(async (type, targetUserId) => {
                const targetUser = users.find(u => u.id === targetUserId);
                if (!targetUser) return;

                // Customize title based on type and context
                let noteTitle = '';
                let noteMessage = '';

                if (type === 'MENTION') {
                    noteTitle = `Nova menção de ${currentUser.username}`;
                    noteMessage = inputValue;
                } else {
                    noteTitle = `Nova mensagem em ${title}`;
                    noteMessage = `${currentUser.username}: ${inputValue}`; // Show sender in message body
                }

                try {
                    await storageService.createNotification({
                        id: '', // Auto-generated
                        userId: targetUser.id,
                        type: type,
                        title: noteTitle,
                        message: noteMessage,
                        projectId: projectId,
                        projectName: title,
                        createdAt: Date.now(),
                        read: false,
                        targetId: savedMsgId // PASS THE ID HERE
                    });
                } catch (err) {
                    console.error("Failed to send notification:", err);
                }
            });
            // ---------------------------

            const currentInput = inputValue;
            setInputValue('');
            setAttachment(null);
            setReplyToMessage(null);

            setReplyToMessage(null);

            // ChatGPT Logic
            if (isAiOnly || currentInput.toLowerCase().startsWith('@chat')) {
                // ... existing logic continues below (partially)
                // Re-inserting the AI logic inside the try/catch or just trigger it
                triggerAiResponse(currentInput);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Erro ao enviar mensagem. Tente novamente ou use uma imagem menor.");
        }
    };

    // Extracted helper to avoid nesting deep in replace code
    // Extracted helper to avoid nesting deep in replace code
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

            // --- AI NOTIFICATION LOGIC ---
            if (projectId === 'global') {
                const recipients = users.length > 0 ? users : [currentUser];

                recipients.forEach(async (u) => {
                    try {
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
                    } catch (err) {
                        console.error("Failed to notify AI response:", err);
                    }
                });
            }
            // -----------------------------
            // -----------------------------

        } finally {
            setIsAiThinking(false);
        }
    };




    const handleContextMenu = (e: React.MouseEvent, msg: ChatMessage) => {
        // Allow default context menu for images/videos so users can "Copy Image", "Save As", etc.
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
            return;
        }

        e.preventDefault();
        // We do NOT use stopPropagation here to allow closing other menus if any
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

        // Close menu first to update UI
        setContextMenu(null);

        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        try {
            if (action === 'delete') {
                // REMOVED CONFIRM: Direct deletion logic
                await storageService.deleteChatMessage(msgId);
            } else if (action === 'star') {
                await storageService.updateChatMessage({
                    ...msg,
                    isStarred: !msg.isStarred
                });
            } else if (action === 'edit') {
                setEditingMessageId(msgId);
                setInputValue(msg.text);
                fileInputRef.current?.focus();
            } else if (action === 'reply') {
                setReplyToMessage(msg);
                fileInputRef.current?.focus();
            }
        } catch (error) {
            console.error("Error performing chat action:", error);
            alert("Não foi possível executar a ação. Verifique o console ou sua conexão.");
        }
    };

    const cancelEditOrReply = () => {
        setEditingMessageId(null);
        setReplyToMessage(null);
        setInputValue('');
    };

    // --- Render Functions ---

    if (indexErrorLink) {
        return (
            <div className={`flex flex-col h-full bg-slate-900 ${isEmbedded ? 'border-l border-slate-700' : ''}`}>
                {/* Same Error UI as before */}
                <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{title}</h2>
                    </div>
                    {isEmbedded && onClose && <button onClick={onClose}><X size={20} /></button>}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isIndexBuilding ? 'bg-indigo-500/20' : 'bg-amber-500/20'}`}>
                        {isIndexBuilding ? <Loader2 className="text-indigo-500 animate-spin" size={32} /> : <AlertTriangle className="text-amber-500" size={32} />}
                    </div>
                    <h3 className="text-xl font-bold text-white">{isIndexBuilding ? 'Criando Índice...' : 'Índice Ausente'}</h3>
                    <p className="text-slate-400 text-sm max-w-xs">
                        {isIndexBuilding
                            ? 'O Firebase está construindo o índice. O chat aparecerá automaticamente.'
                            : 'O Firebase precisa de um índice composto.'}
                    </p>
                    {!isIndexBuilding && (
                        <a href={indexErrorLink} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold">Criar Índice</a>
                    )}
                </div>
            </div>
        );
    }

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    // ... (rest of logic)

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
                    // Selection mode header
                    <>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={exitSelectionMode}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <span className="text-slate-900 dark:text-white font-semibold transition-colors">
                                {selectedMessages.size} selecionada{selectedMessages.size !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={copySelectedMessages}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Copiar"
                            >
                                <Copy size={20} />
                            </button>
                            <button
                                onClick={deleteSelectedMessages}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Deletar"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    // Normal header
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
                {messages.map((msg) => {
                    // DEBUG: Check if mediaUrl exists
                    if (msg.mediaUrl) console.log("Rendering msg with media:", msg.id, msg.mediaType);
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
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Selection checkbox */}
                                {selectionMode && (
                                    <div
                                        onClick={() => toggleMessageSelection(msg.id)}
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
                                        onContextMenu={(e) => handleContextMenu(e, msg)}
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
                                                            setSelectedImage(msg.mediaUrl!);
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
                                                        const isValidUser = users.some(u => u.username === username) || username === 'chat';
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
                })}
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

            {/* Context Menu Overlay - THIS IS THE FIX */}
            {contextMenu && (
                <>
                    {/* Transparent backdrop to catch clicks and close menu */}
                    <div
                        className="fixed inset-0 z-[45]"
                        onClick={() => setContextMenu(null)}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                    ></div>

                    <div
                        className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[50] py-1 min-w-[150px] animate-fade-in"
                        style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 160) }}
                    >
                        <button
                            onClick={() => {
                                enterSelectionMode(contextMenu.msgId);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center"
                        >
                            <Check size={16} className="mr-2" />
                            Selecionar
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction('reply'); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center"
                        >
                            <Reply size={14} className="mr-2" /> Responder
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAction('star'); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center"
                        >
                            <Star size={14} className="mr-2" /> Favoritar
                        </button>
                        {contextMenu.isMe && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction('edit'); }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center"
                                >
                                    <Edit2 size={14} className="mr-2" /> Editar
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction('delete'); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 flex items-center"
                                >
                                    <Trash2 size={14} className="mr-2" /> Apagar
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
                    />
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors">

                {/* Context Preview (Reply/Edit) */}
                {(replyToMessage || editingMessageId) && (
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-2 rounded-t-lg border border-slate-300 dark:border-slate-700 border-b-0 transition-colors">
                        <div className="text-xs text-slate-700 dark:text-slate-300 border-l-2 pl-2 border-indigo-500 overflow-hidden transition-colors">
                            {editingMessageId ? (
                                <>
                                    <span className="font-bold text-indigo-400 block">Editando Mensagem</span>
                                </>
                            ) : (
                                <>
                                    <span className="font-bold text-indigo-400 block">Respondendo a {replyToMessage?.username}</span>
                                    <span className="truncate block opacity-70">{replyToMessage?.text}</span>
                                </>
                            )}
                        </div>
                        <button type="button" onClick={cancelEditOrReply} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Attachment Preview */}
                {attachment && (
                    <div className="mb-2 flex items-center bg-slate-100 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-300 dark:border-slate-600 w-fit transition-colors">
                        <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden mr-2 border border-slate-300 dark:border-slate-700 transition-colors">
                            {attachment.type === 'video' ? (
                                <video src={attachment.url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setAttachment(null)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="relative">
                    {/* Mentions Dropdown */}
                    {showMentions && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto animate-fade-in">
                            {(() => {
                                const chatGPTUser: User = {
                                    id: 'chatgpt-bot',
                                    username: 'chat',
                                    email: 'ai@partnersync.com',
                                    avatar: '',
                                    companyId: companyId,
                                    role: 'MEMBER'
                                };
                                const suggestedUsers = [chatGPTUser, ...users].filter(u => u.username.toLowerCase().includes(mentionQuery));

                                if (suggestedUsers.length === 0) {
                                    return <div className="p-2 text-sm text-slate-500 text-center">Ninguém encontrado</div>;
                                }

                                return suggestedUsers.map((user, idx) => (
                                    <button
                                        key={user.id}
                                        onClick={() => insertMention(user.username)}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${idx === mentionIndex
                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden text-xs font-bold flex-shrink-0 ${user.id === 'chatgpt-bot' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                            {user.id === 'chatgpt-bot' ? <Sparkles size={14} /> : (user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username[0].toUpperCase())}
                                        </div>
                                        <span className="truncate flex-1">{user.username} {user.id === 'chatgpt-bot' && <span className="text-xs opacity-70 ml-1">(IA)</span>}</span>
                                    </button>
                                ));
                            })()}
                        </div>
                    )}

                    <div className={`flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all ${(replyToMessage || editingMessageId) ? 'rounded-b-xl border-t-0' : 'rounded-xl'}`}>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                            title="Anexar imagem ou vídeo"
                        >
                            <Paperclip size={18} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*"
                        />

                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
                                    handleSendMessage();
                                }
                                handleKeyDown(e);
                            }}
                            onPaste={handlePaste}
                            placeholder={isEmbedded ? "Mensagem..." : "Digite sua mensagem... use @ para mencionar"}
                            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-2 focus:outline-none min-w-0 text-sm transition-colors"
                        />
                        <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() && !attachment}
                            className={`p-2 text-white rounded-lg transition-colors flex-shrink-0 ${editingMessageId ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {editingMessageId ? <Check size={18} /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;