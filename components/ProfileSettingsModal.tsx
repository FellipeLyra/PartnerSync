import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Phone, Mail, Camera, X } from 'lucide-react';
import AvatarEditor from './AvatarEditor';

interface ProfileSettingsModalProps {
    currentUser: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (user: User) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ currentUser, isOpen, onClose, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '(64) 99232-7984'
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser.avatar || null);
    const [isSaving, setIsSaving] = useState(false);

    // Avatar Editor State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setShowEditor(true);
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveAvatar = (base64: string) => {
        setAvatarPreview(base64);
        setShowEditor(false);
        setSelectedImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const updatedUser: User = {
                ...currentUser,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                avatar: avatarPreview || undefined
            };

            await onUpdateUser(updatedUser);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-0 border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in relative transition-all overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div
                                className="relative group cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-4 border-white dark:border-slate-600 shadow-lg overflow-hidden transition-colors">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={40} className="text-slate-400 dark:text-slate-500" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Clique para alterar a foto</p>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">WhatsApp / Telefone</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(64) 99232-7984"
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Nested Avatar Editor Modal */}
            {showEditor && selectedImage && (
                <AvatarEditor
                    imageSrc={selectedImage}
                    onSave={handleSaveAvatar}
                    onCancel={() => { setShowEditor(false); setSelectedImage(null); }}
                />
            )}
        </div>
    );
};

export default ProfileSettingsModal;
