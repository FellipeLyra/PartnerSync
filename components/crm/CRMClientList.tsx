import React, { useState, useEffect } from 'react';
import { User, Client, ViewState } from '../../types';
import { crmService } from '../../services/crmService';
import { Search, Plus, Phone, Mail, Building, MoreVertical, Linkedin, ExternalLink, Trash2, MessageCircle } from 'lucide-react';
import ClientChat from './ClientChat';

interface ClientListProps {
    currentUser: User;
    companyId: string;
}

const CRMClientList: React.FC<ClientListProps> = ({ currentUser, companyId }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedClientForChat, setSelectedClientForChat] = useState<Client | null>(null);


    // Form State
    const [formData, setFormData] = useState<Partial<Client>>({});

    useEffect(() => {
        const unsubscribe = crmService.subscribeClients(companyId, (data) => {
            setClients(data);
            setFilteredClients(data);
        });
        return () => unsubscribe();
    }, [companyId]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = clients.filter(c =>
            c.name.toLowerCase().includes(lower) ||
            c.organizationName?.toLowerCase().includes(lower) ||
            c.email?.toLowerCase().includes(lower)
        );
        setFilteredClients(filtered);
    }, [searchTerm, clients]);

    const handleSave = async () => {
        if (!formData.name || !companyId) return;

        const clientToSave: Client = {
            id: formData.id || '',
            companyId: companyId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            organizationName: formData.organizationName,
            role: formData.role,
            linkedinProfile: formData.linkedinProfile,
            createdAt: formData.createdAt || Date.now(),
        };

        try {
            await crmService.saveClient(clientToSave);
            setShowModal(false);
            setFormData({});
        } catch (error) {
            alert("Erro ao salvar cliente.");
        }
    };

    const handleDelete = async (clientId: string) => {
        if (confirm("Tem certeza que deseja excluir este cliente? Todas as interações serão perdidas.")) {
            await crmService.deleteClient(clientId);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* TOOLBAR */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, empresa ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
                <button
                    onClick={() => { setFormData({}); setShowModal(true); }}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg flex items-center shadow-lg transition-colors"
                >
                    <Plus size={18} className="mr-2" />
                    Novo Cliente
                </button>
            </div>

            {/* LIST */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm dark:shadow-none transition-colors">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs uppercase font-bold sticky top-0 z-10 transition-colors">
                            <tr>
                                <th className="p-4">Nome / Cargo</th>
                                <th className="p-4">Empresa</th>
                                <th className="p-4">Contato</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 transition-colors">
                            {filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{client.name}</div>
                                        {client.role && <div className="text-xs text-slate-500">{client.role}</div>}
                                    </td>
                                    <td className="p-4">
                                        {client.organizationName ? (
                                            <div className="flex items-center text-slate-600 dark:text-slate-300">
                                                <Building size={14} className="mr-2 text-slate-400 dark:text-slate-500" />
                                                {client.organizationName}
                                            </div>
                                        ) : <span className="text-slate-400 dark:text-slate-600">-</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col space-y-1">
                                            {client.email && (
                                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                                    <Mail size={12} className="mr-2" /> {client.email}
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                                    <Phone size={12} className="mr-2" /> {client.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {client.linkedinProfile && (
                                                <a href={client.linkedinProfile} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-blue-500 dark:text-blue-400 hover:text-white hover:bg-blue-600 transition-colors" title="LinkedIn">
                                                    <Linkedin size={16} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => { setFormData(client); setShowModal(true); }}
                                                className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                title="Editar"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setSelectedClientForChat(client)}
                                                className="p-2 bg-emerald-50 dark:bg-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-white hover:bg-emerald-600 transition-colors"
                                                title="Abrir Chat (WhatsApp)"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2 bg-red-50 dark:bg-slate-700 rounded-lg text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{formData.id ? 'Editar Cliente' : 'Novo Cliente'}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome Completo *</label>
                                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Empresa</label>
                                    <input type="text" value={formData.organizationName || ''} onChange={e => setFormData({ ...formData, organizationName: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cargo</label>
                                    <input type="text" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</label>
                                <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Telefone / WhatsApp</label>
                                <input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">LinkedIn (URL)</label>
                                <input type="text" value={formData.linkedinProfile || ''} onChange={e => setFormData({ ...formData, linkedinProfile: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* CHAT MODAL */}
            {selectedClientForChat && (
                <ClientChat
                    client={selectedClientForChat}
                    currentUser={currentUser}
                    companyId={companyId}
                    onClose={() => setSelectedClientForChat(null)}
                />
            )}
        </div>
    );
};

export default CRMClientList;
