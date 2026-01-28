import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Paperclip, X, Image as ImageIcon, AlertTriangle, Loader2, MoreVertical, Star, Trash2, Edit2, Reply, Check } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { storageService } from '../services/storageService';
import { askGemini } from '../services/geminiService';

interface ChatProps {
    currentUser: User;
    projectId?: string; // 'global' if undefined
    title?: string;
    isEmbedded?: boolean; // If true, renders with a close button and slightly different layout
    onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({
    currentUser,
    projectId = 'global',
    title = 'Chat da Equipe',
    isEmbedded = false,
    onClose
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
    const [indexErrorLink, setIndexErrorLink] = useState<string | null>(null);
    const [isIndexBuilding, setIsIndexBuilding] = useState(false);

    // Interaction States
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string, isMe: boolean } | null>(null);

    // Legacy Avatar Support for old messages
    const [knownAvatars, setKnownAvatars] = useState<Record<string, string>>({});
    const knownAvatarsRef = useRef<Record<string, string>>({}); // Ref to avoid useEffect dependency loops

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setIndexErrorLink(null);
        setIsIndexBuilding(false);
        setEditingMessageId(null);
        setReplyToMessage(null);

        const unsubscribe = storageService.subscribeChat(projectId, (msgs) => {
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
    }, [projectId]);

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
            const type = file.type.startsWith('video') ? 'video' : 'image';
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment({
                    url: reader.result as string,
                    type: type
                });
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !attachment) return;

        if (editingMessageId) {
            // Handle Edit
            const msgToUpdate = messages.find(m => m.id === editingMessageId);
            if (msgToUpdate) {
                await storageService.updateChatMessage({
                    ...msgToUpdate,
                    text: inputValue,
                    isEdited: true
                });
            }
            setEditingMessageId(null);
            setInputValue('');
            setAttachment(null);
            return;
        }

        // Handle New Message
        const userMsg: ChatMessage = {
            id: '', // Auto-generated
            userId: currentUser.id,
            username: currentUser.username,
            text: inputValue,
            timestamp: Date.now(),
            mediaUrl: attachment?.url,
            mediaType: attachment?.type,
            projectId: projectId,
            replyTo: replyToMessage ? {
                id: replyToMessage.id,
                username: replyToMessage.username,
                text: replyToMessage.text.substring(0, 50) + (replyToMessage.text.length > 50 ? '...' : '')
            } : undefined,
            userAvatar: currentUser.avatar
        };

        await storageService.saveChatMessage(userMsg);

        const currentInput = inputValue;
        setInputValue('');
        setAttachment(null);
        setReplyToMessage(null);

        // Gemini Logic
        if (currentInput.toLowerCase().startsWith('@gemini')) {
            setIsAiThinking(true);
            const prompt = currentInput.replace('@gemini', '').trim();
            const context = projectId === 'global'
                ? `Você está no Chat Global da Equipe. Usuário: ${currentUser.username}.`
                : `Você está no Chat do Projeto "${title}". Usuário: ${currentUser.username}.`;

            try {
                const aiResponseText = await askGemini(prompt, context);
                const aiMsg: ChatMessage = {
                    id: '',
                    userId: 'ai-gemini',
                    username: 'Gemini AI',
                    text: aiResponseText,
                    timestamp: Date.now() + 1,
                    isAi: true,
                    projectId: projectId
                };
                await storageService.saveChatMessage(aiMsg);
            } finally {
                setIsAiThinking(false);
            }
        }
    };

    const handleContextMenu = (e: React.MouseEvent, msg: ChatMessage) => {
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
                    <div className="flex items-center">
                        <h2 className="font-bold text-white">Configuração</h2>
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

    return (
        <div className={`flex flex-col h-full bg-slate-900 ${isEmbedded ? 'border-l border-slate-700' : ''}`} ref={chatContainerRef}>
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between shadow-sm flex-shrink-0">
                <div className="flex items-center min-w-0">
                    {projectId === 'global' ? <Bot className="mr-2 text-indigo-400 flex-shrink-0" /> : <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>}
                    <h2 className="font-bold text-white truncate">{title}</h2>
                </div>
                <div className="flex items-center space-x-2">
                    {!isEmbedded && (
                        <div className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full flex items-center hidden md:flex">
                            <Sparkles size={12} className="mr-1 text-yellow-400" />
                            <span className="text-indigo-300 font-mono mx-1">@gemini</span>
                        </div>
                    )}
                    {isEmbedded && onClose && (
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
                            <X size={20} />
                        </button>
                    )}
                </div>
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
                            className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden mt-1 ${isAi ? 'bg-indigo-600 text-white' : isMe ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-200'
                                    } ${isMe ? 'ml-2' : 'mr-2'}`}>
                                    {avatarDisplay}
                                </div>

                                {/* Bubble Container */}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline space-x-2 mb-1">
                                        <span className="text-[10px] font-bold text-slate-400">{msg.username}</span>
                                        <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {/* Reply Context */}
                                    {msg.replyTo && (
                                        <div className={`mb-1 px-3 py-2 rounded-lg text-xs border-l-4 opacity-80 ${isMe ? 'bg-emerald-900/50 border-emerald-400 text-emerald-100' : 'bg-slate-800 border-indigo-400 text-slate-300'}`}>
                                            <p className="font-bold mb-0.5">{msg.replyTo.username}</p>
                                            <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                                        </div>
                                    )}

                                    <div
                                        onContextMenu={(e) => handleContextMenu(e, msg)}
                                        className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-md whitespace-pre-wrap break-words cursor-pointer select-text transition-all ${isAi
                                            ? 'bg-slate-800 border border-indigo-500/30 text-indigo-100 rounded-tl-none'
                                            : isMe
                                                ? 'bg-emerald-600 text-white rounded-tr-none hover:bg-emerald-500'
                                                : 'bg-slate-700 text-slate-100 rounded-tl-none hover:bg-slate-600'
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
                                                    <img src={msg.mediaUrl} alt="attachment" className="max-h-48 rounded-lg object-contain bg-black/20" />
                                                )}
                                            </div>
                                        )}

                                        {msg.text}

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

            {/* Input Area */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">

                {/* Context Preview (Reply/Edit) */}
                {(replyToMessage || editingMessageId) && (
                    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-t-lg border border-slate-700 border-b-0">
                        <div className="text-xs text-slate-300 border-l-2 pl-2 border-indigo-500 overflow-hidden">
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
                        <button type="button" onClick={cancelEditOrReply} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Attachment Preview */}
                {attachment && (
                    <div className="mb-2 flex items-center bg-slate-900/50 p-2 rounded-lg border border-slate-600 w-fit">
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center overflow-hidden mr-2 border border-slate-700">
                            {attachment.type === 'video' ? (
                                <video src={attachment.url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setAttachment(null)}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className={`flex items-center space-x-2 bg-slate-900 p-2 border border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all ${(replyToMessage || editingMessageId) ? 'rounded-b-xl border-t-0' : 'rounded-xl'}`}>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
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
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isEmbedded ? "Mensagem..." : "Digite sua mensagem..."}
                        className="flex-1 bg-transparent text-white placeholder-slate-500 px-2 focus:outline-none min-w-0 text-sm"
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
    );
};

export default Chat;