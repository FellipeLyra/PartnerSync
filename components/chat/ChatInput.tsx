import React, { useState, useRef, useEffect } from 'react';
import { Send, Check, Paperclip, X, Sparkles } from 'lucide-react';
import type { User, ChatMessage } from '../../types';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onFileSelect: (file: File) => void;
    attachment: { file?: File, url: string, type: 'image' | 'video' } | null;
    onRemoveAttachment: () => void;

    // Context (Reply/Edit)
    replyToMessage: ChatMessage | null;
    editingMessage: { id: string, text: string } | null;
    onCancelContext: () => void; // Cancels edit or reply

    // Mentions
    users: User[];
    companyId: string; // for rendering avatars if needed

    isEmbedded?: boolean;
    inputPlaceholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onFileSelect,
    attachment,
    onRemoveAttachment,
    replyToMessage,
    editingMessage,
    onCancelContext,
    users,
    companyId,
    isEmbedded,
    inputPlaceholder
}) => {
    const [inputValue, setInputValue] = useState('');

    // Suggestion States
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionIndex, setMentionIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input value when entering edit mode
    useEffect(() => {
        if (editingMessage) {
            setInputValue(editingMessage.text);
            inputRef.current?.focus();
        } else if (!replyToMessage) {
            // Only clear if we are NOT ensuring reply context (actually reply doesn't affect text, so maybe safe to clear if we exited edit)
            // But usually we don't clear text when REPLYING starts, only when EDITING starts (to populate).
            // When cancelling edit, we might want to clear or revert? 
            // For now, let's just populate on edit.
        }
    }, [editingMessage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Mention logic
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
        items.pop();
        const newValue = [...items, `@${username} `].join(' ');
        setInputValue(newValue);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const handleSend = () => {
        if (!inputValue.trim() && !attachment) return;
        onSendMessage(inputValue);
        setInputValue('');
        setShowMentions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
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
                return; // Stop event here if handling mentions
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    onFileSelect(file);
                    e.preventDefault();
                }
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors">

            {/* Context Preview (Reply/Edit) */}
            {(replyToMessage || editingMessage) && (
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 p-2 rounded-t-lg border border-slate-300 dark:border-slate-700 border-b-0 transition-colors">
                    <div className="text-xs text-slate-700 dark:text-slate-300 border-l-2 pl-2 border-indigo-500 overflow-hidden transition-colors">
                        {editingMessage ? (
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
                    <button type="button" onClick={() => { setInputValue(''); onCancelContext(); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 transition-colors">
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
                        onClick={onRemoveAttachment}
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

                <div className={`flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all ${(replyToMessage || editingMessage) ? 'rounded-b-xl border-t-0' : 'rounded-xl'}`}>

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
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*"
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={inputPlaceholder || (isEmbedded ? "Mensagem..." : "Digite sua mensagem... use @ para mencionar")}
                        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-2 focus:outline-none min-w-0 text-sm transition-colors"
                        autoFocus={!isEmbedded}
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!inputValue.trim() && !attachment}
                        className={`p-2 text-white rounded-lg transition-colors flex-shrink-0 ${editingMessage ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {editingMessage ? <Check size={18} /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
