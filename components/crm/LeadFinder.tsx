import React, { useState, useEffect } from 'react';
import { SavedSearch, SearchRun } from '../../types';
import { leadFinderService } from '@/services/leadFinderService';
import SearchBuilder from './lead-finder/SearchBuilder';
import ResultsPreview from './lead-finder/ResultsPreview';
import ConfirmModal from '../ui/ConfirmModal';
import { Plus, Play, History, Trash2, MapPin, Tag, Edit2 } from 'lucide-react';

interface LeadFinderProps {
    companyId: string;
}

const LeadFinder: React.FC<LeadFinderProps> = ({ companyId }) => {
    const [view, setView] = useState<'LIST' | 'NEW' | 'RESULTS'>('LIST');
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [activeSearch, setActiveSearch] = useState<SavedSearch | null>(null);
    const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadSearches();
    }, [companyId]);

    const loadSearches = async () => {
        const searches = await leadFinderService.getSavedSearches(companyId);
        setSavedSearches(searches);
    };

    const handleSaveSearch = async (searchData: any) => {
        if (editingSearch) {
            await leadFinderService.updateSearch(editingSearch.id, { ...searchData, companyId });
        } else {
            await leadFinderService.saveSearch({ ...searchData, companyId });
        }
        await loadSearches();
        setView('LIST');
        setEditingSearch(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await leadFinderService.deleteSearch(deleteId);
        await loadSearches();
        setDeleteId(null);
    };

    const handleSaveAndRun = async (searchData: any) => {
        const id = await leadFinderService.saveSearch({ ...searchData, companyId });
        await loadSearches();
        // Construct full object to start running immediately
        setActiveSearch({
            ...searchData,
            companyId,
            id: id!,
            createdAt: Date.now()
        } as SavedSearch);
        setView('RESULTS');
    };

    const handleRunSearch = (search: SavedSearch) => {
        setActiveSearch(search);
        setView('RESULTS');
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            {view === 'LIST' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lead Finder</h2>
                            <p className="text-slate-500 dark:text-slate-400">Encontre novos leads automaticamente usando OpenStreetMap</p>
                        </div>
                        <button
                            onClick={() => setView('NEW')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            Nova Busca
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedSearches.map((search) => (
                            <div key={search.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{search.name}</h3>
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                                        {search.schedule || 'MANUAL'}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Tag size={16} className="text-indigo-500" />
                                        <span>{search.filters.niche}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin size={16} className="text-indigo-500" />
                                        <span>
                                            {search.filters.locationType === 'CITY'
                                                ? search.filters.city
                                                : `Raio ${search.filters.coordinates?.radiusKm}km`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingSearch(search); setView('NEW'); }}
                                            className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(search.id, e)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRunSearch(search)}
                                        className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium text-sm"
                                    >
                                        <Play size={16} />
                                        Executar Agora
                                    </button>
                                </div>
                            </div>
                        ))}

                        {savedSearches.length === 0 && (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">Nenhuma busca salva</h3>
                                <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-6">
                                    Crie sua primeira busca para encontrar leads automaticamente no OpenStreetMap.
                                </p>
                                <button
                                    onClick={() => setView('NEW')}
                                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                                >
                                    Criar Busca
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'NEW' && (
                <SearchBuilder
                    initialData={editingSearch || undefined}
                    onCancel={() => { setView('LIST'); setEditingSearch(null); }}
                    onSave={handleSaveSearch}
                    onSaveAndRun={handleSaveAndRun}
                />
            )}

            {view === 'RESULTS' && activeSearch && (
                <ResultsPreview
                    search={activeSearch}
                    companyId={companyId}
                    onBack={() => setView('LIST')}
                />
            )}
            {/* DELETE MODAL */}
            <ConfirmModal
                isOpen={!!deleteId}
                title="Excluir Busca"
                message="Tem certeza que deseja excluir esta busca? Todo o histórico de execuções também será removido."
                confirmText="Excluir"
                isDestructive
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default LeadFinder;

// Mock icons if needed, but imported correctly above
const Search = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
