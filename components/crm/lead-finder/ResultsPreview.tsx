import React, { useState, useEffect } from 'react';
import { SavedSearch, LeadCandidate } from '../../../types';
import { osmService } from '@/services/osmService';
import { leadFinderService } from '@/services/leadFinderService';
import { ArrowLeft, Check, Download, AlertCircle, RefreshCw, XCircle, Search, Phone, Globe, Instagram } from 'lucide-react';

interface ResultsPreviewProps {
    search: SavedSearch;
    companyId: string;
    onBack: () => void;
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({ search, companyId, onBack }) => {
    const [candidates, setCandidates] = useState<LeadCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'DUPLICATE'>('ALL');

    useEffect(() => {
        executeSearch();
    }, [search]);

    const executeSearch = async () => {
        setLoading(true);
        try {
            // 1. Get Location
            // 1. Get Location
            let location: any = null;

            if (search.filters.city) {
                try {
                    const geo = await osmService.geocodeCity(search.filters.city);
                    if (geo) {
                        if (search.filters.locationType === 'RADIUS' && search.filters.coordinates) {
                            location = {
                                type: 'RADIUS',
                                lat: geo.lat,
                                lon: geo.lon,
                                radiusKm: search.filters.coordinates.radiusKm
                            };
                        } else {
                            // City box
                            location = {
                                type: 'BOX',
                                box: geo.boundingBox
                            };
                        }
                    } else {
                        throw new Error(`Não foi possível encontrar a localização: ${search.filters.city}`);
                    }
                } catch (err) {
                    console.error("Geocoding error", err);
                    throw new Error(`Erro ao buscar localização: ${search.filters.city}`);
                }
            } else {
                throw new Error("Cidade não definida para a busca.");
            }

            if (!location) {
                throw new Error("Falha ao definir área de busca.");
            }

            // 2. Fetch from OSM
            const rawResults = await osmService.searchByTags(search.filters.osmTags, location);

            // 3. Filter by requirements (Phone/Website)
            let filtered = rawResults;
            if (search.filters.mustHavePhone) filtered = filtered.filter(c => !!c.phone);
            if (search.filters.mustHaveWebsite) filtered = filtered.filter(c => !!c.website || !!c.instagram);

            // 4. Deduplicate
            const deduped = await leadFinderService.deduplicateCandidates(companyId, filtered);

            setCandidates(deduped);

            // Auto-select NEW valid candidates
            const newIds = new Set(deduped.filter(c => c.status === 'NEW').map(c => c.id));
            setSelectedIds(newIds);

            // Log Run
            await leadFinderService.logRun({
                searchId: search.id,
                companyId,
                date: Date.now(),
                totalFound: deduped.length,
                newLeads: newIds.size,
                duplicates: deduped.length - newIds.size,
                status: 'COMPLETED'
            });

        } catch (error) {
            console.error("Search failed:", error);
            const message = error instanceof Error ? error.message : "Erro desconhecido ao executar busca.";
            alert(`Falha na busca: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            const toImport = candidates.filter(c => selectedIds.has(c.id));
            const importedIds = await leadFinderService.importCandidates(companyId, toImport);

            // Mark as imported in local state
            setCandidates(prev => prev.map(c =>
                importedIds.includes(c.id) || (selectedIds.has(c.id) && c.status === 'NEW') // Fallback check
                    ? { ...c, status: 'IMPORTED' }
                    : c
            ));

            setSelectedIds(new Set()); // Clear selection
            alert(`${importedIds.length} leads importados/atualizados com sucesso!`);
        } catch (error) {
            console.error("Import failed:", error);
            alert("Erro ao importar leads.");
        } finally {
            setImporting(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const filteredCandidates = candidates.filter(c => {
        if (statusFilter === 'ALL') return true;
        return c.status === statusFilter;
    });

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {search.name}
                            <span className="text-xs font-normal px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                                {candidates.length} encontrados
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {search.filters.city} • {search.filters.niche}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => executeSearch()}
                        disabled={loading}
                        className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Recarregar"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleImport}
                        disabled={selectedIds.size === 0 || importing}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
                    >
                        {importing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        Importar / Atualizar ({selectedIds.size})
                    </button>
                </div>
            </div>

            {/* Filters & Content */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 animate-pulse">Buscando no OpenStreetMap...</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Isso pode levar alguns segundos dependendo da quantidade de dados.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex gap-2">
                        {(['ALL', 'NEW', 'DUPLICATE'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === status
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {status === 'ALL' && 'Todos'}
                                {status === 'NEW' && 'Novos'}
                                {status === 'DUPLICATE' && 'Duplicados'}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                                <tr>
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
                                                else setSelectedIds(new Set());
                                            }}
                                            className="rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="p-4">Empresa</th>
                                    <th className="p-4">Telefone</th>
                                    <th className="p-4">Website</th>
                                    <th className="p-4">Instagram</th>
                                    <th className="p-4">Localização</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredCandidates.map(candidate => (
                                    <tr key={candidate.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.has(candidate.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(candidate.id)}
                                                onChange={() => toggleSelection(candidate.id)}
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{candidate.name}</div>
                                        </td>
                                        <td className="p-4">
                                            {candidate.phone ? (
                                                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                    <Phone size={14} /> {candidate.phone}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Sem telefone</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {candidate.website && !candidate.website.includes('instagram') ? (
                                                <a href={candidate.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
                                                    <Globe size={14} /> Website
                                                </a>
                                            ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                        </td>
                                        <td className="p-4">
                                            {candidate.instagram ? (
                                                <a href={candidate.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-pink-600 hover:underline">
                                                    <Instagram size={14} /> Instagram
                                                </a>
                                            ) : <span className="text-slate-300 dark:text-slate-700">-</span>}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="truncate max-w-[200px]" title={candidate.address}>{candidate.address || candidate.city}</div>
                                        </td>
                                        <td className="p-4">
                                            {candidate.status === 'NEW' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                                                    Novo
                                                </span>
                                            )}
                                            {candidate.status === 'DUPLICATE' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400" title={candidate.duplicateReason}>
                                                    Duplicado
                                                </span>
                                            )}
                                            {candidate.status === 'IMPORTED' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                                                    Importado
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredCandidates.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                                            Nenhum resultado encontrado com os filtros atuais.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsPreview;
