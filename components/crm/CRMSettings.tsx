import React, { useState } from 'react';
import { User } from '../../types';
import { Save, User as UserIcon, Phone, Mail } from 'lucide-react';

interface CRMSettingsProps {
    currentUser: User;
    onUpdateUser: (user: User) => void;
}

const CRMSettings: React.FC<CRMSettingsProps> = ({ currentUser, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        username: currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '(64) 99232-7984'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const updatedUser: User = {
                ...currentUser,
                username: formData.username,
                email: formData.email,
                phone: formData.phone
            };

            await onUpdateUser(updatedUser);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 p-8 overflow-y-auto transition-colors">
            <div className="max-w-2xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Configurações do Perfil</h2>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg transition-colors">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Display */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-indigo-500 overflow-hidden">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={40} className="text-slate-400 dark:text-slate-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold text-lg">{currentUser.username}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">role: {currentUser.role}</p>
                            </div>
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
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Este número será usado para integrações futuras com WhatsApp.</p>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors">
                            {message && (
                                <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {message.text}
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all ml-auto disabled:opacity-50"
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CRMSettings;
