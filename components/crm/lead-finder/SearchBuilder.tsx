import React, { useState } from 'react';
import { SavedSearch } from '../../../types';
import { Search, MapPin, Globe, Phone, Save, X, Play } from 'lucide-react';
import { osmService } from '@/services/osmService';

interface SearchBuilderProps {
    initialData?: SavedSearch;
    onCancel: () => void;
    onSave: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void;
    onSaveAndRun: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void;
}

const NICHE_PRESETS = [
    { label: 'Academias & Crossfit', tags: ['amenity=gym', 'leisure=fitness_centre', 'sport=fitness'] },
    { label: 'Restaurantes', tags: ['amenity=restaurant'] },
    { label: 'Bares', tags: ['amenity=bar', 'amenity=pub'] },
    { label: 'Oficinas Mecânicas', tags: ['shop=car_repair'] },
    { label: 'Estética Automotiva', tags: ['shop=car_repair', 'service=vehicle:cleaning'] },
    { label: 'Salões de Beleza', tags: ['shop=hairdresser', 'shop=beauty'] },
    { label: 'Clínicas Médicas', tags: ['amenity=clinic', 'amenity=doctors'] },
    { label: 'Imobiliárias', tags: ['office=estate_agent'] },
    { label: 'Advocacia', tags: ['office=lawyer'] },
    { label: 'Pet Shops', tags: ['shop=pet'] }
];

const SearchBuilder: React.FC<SearchBuilderProps> = ({ initialData, onCancel, onSave, onSaveAndRun }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [niche, setNiche] = useState(initialData?.filters.niche || '');
    const [customTags, setCustomTags] = useState(initialData?.filters.osmTags.join(', ') || '');
    const [locationType, setLocationType] = useState<'CITY' | 'RADIUS'>(initialData?.filters.locationType || 'CITY');
    const [city, setCity] = useState(initialData?.filters.city || '');
    const [radius, setRadius] = useState(initialData?.filters.coordinates?.radiusKm || 5);
    const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(
        initialData?.filters.coordinates ? { lat: initialData.filters.coordinates.lat, lng: initialData.filters.coordinates.lng } : null
    );
    const [mustHaveWebsite, setMustHaveWebsite] = useState(initialData?.filters.mustHaveWebsite || false);
    const [mustHavePhone, setMustHavePhone] = useState(initialData?.filters.mustHavePhone || false);
    const [loadingGeo, setLoadingGeo] = useState(false);

    const handleNicheSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = NICHE_PRESETS.find(p => p.label === e.target.value);
        if (selected) {
            setNiche(selected.label);
            setCustomTags(selected.tags.join(', '));
        } else {
            setNiche(e.target.value);
            if (e.target.value === 'custom') setCustomTags('');
        }
    };

    const handleCityBlur = async () => {
        if (!city || locationType !== 'CITY') return;
        setLoadingGeo(true);
        const geo = await osmService.geocodeCity(city);
        if (geo) {
            setCenterCoords({ lat: geo.lat, lng: geo.lon });
        }
        setLoadingGeo(false);
    };

    const getSearchData = (): Omit<SavedSearch, 'id' | 'createdAt'> | null => {
        if (!name || (!customTags && !niche)) return null;

        const tags = customTags.split(',').map(t => t.trim()).filter(Boolean);

        return {
            companyId: '', // Filled by parent
            name,
            filters: {
                niche: niche === 'custom' ? 'Custom' : niche,
                osmTags: tags,
                locationType,
                city: locationType === 'CITY' ? city : undefined,
                coordinates: locationType === 'RADIUS' && centerCoords ? {
                    lat: centerCoords.lat,
                    lng: centerCoords.lng,
                    radiusKm: radius
                } : undefined,
                mustHaveWebsite,
                mustHavePhone
            }
        };
    };

    const handleSave = () => {
        const data = getSearchData();
        if (data) onSave(data);
    };

    const handleSaveAndRun = () => {
        const data = getSearchData();
        if (data) onSaveAndRun(data);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-slideUp">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Editar Busca' : 'Nova Busca Automática'}</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome da Busca</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Academias em SP"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nicho / Segmento</label>
                        <select
                            value={NICHE_PRESETS.some(p => p.label === niche) ? niche : 'custom'}
                            onChange={handleNicheSelect}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                        >
                            <option value="" disabled>Selecione um nicho...</option>
                            {NICHE_PRESETS.map(p => (
                                <option key={p.label} value={p.label}>{p.label}</option>
                            ))}
                            <option value="custom">Outro / Tags Personalizadas</option>
                        </select>
                        <input
                            type="text"
                            value={customTags}
                            onChange={(e) => setCustomTags(e.target.value)}
                            placeholder="Tags OSM (ex: amenity=cafe, shop=bakery)"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-sm font-mono"
                        />
                        <p className="text-xs text-slate-400 mt-1">Separe múltiplas tags por vírgula. Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">key=value</code> ou apenas <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">key=*</code>.</p>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        <label className="flex items-center gap-2 text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                            <MapPin size={16} />
                            Localização
                        </label>

                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setLocationType('CITY')}
                                className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${locationType === 'CITY' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                                Cidade
                            </button>
                            <button
                                onClick={() => setLocationType('RADIUS')}
                                className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${locationType === 'RADIUS' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                                Raio (km)
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                onBlur={handleCityBlur}
                                placeholder="Digite a cidade (ex: Curitiba, PR)"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {loadingGeo && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {locationType === 'RADIUS' && (
                            <div className="mt-4">
                                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Raio de Busca: {radius}km</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    className="w-full accent-indigo-600"
                                />
                                <p className="text-xs text-slate-400 mt-1">A busca será feita num raio de {radius}km a partir do centro da cidade selecionada acima.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Filtros de Qualidade</label>

                        <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-3">
                            <input
                                type="checkbox"
                                checked={mustHaveWebsite}
                                onChange={(e) => setMustHaveWebsite(e.target.checked)}
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                                    <Globe size={16} className="text-indigo-500" />
                                    Apenas com Website/Instagram
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ignorar resultados sem presença digital identificada</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <input
                                type="checkbox"
                                checked={mustHavePhone}
                                onChange={(e) => setMustHavePhone(e.target.checked)}
                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                                    <Phone size={16} className="text-indigo-500" />
                                    Apenas com Telefone
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ignorar resultados sem contato telefônico</p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-indigo-100 mb-1">Como funciona?</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    O sistema irá buscar dados públicos no OpenStreetMap.
                                    Os resultados serão comparados com seu CRM para evitar duplicatas.
                                    Você poderá revisar a lista antes de importar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={!name || !city}
                    className="px-6 py-2.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                >
                    <Save size={18} />
                    {initialData ? 'Salvar Alterações' : 'Salvar'}
                </button>
                <button
                    onClick={handleSaveAndRun}
                    disabled={!name || !city}
                    className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <Play size={18} />
                    Salvar e Executar
                </button>
            </div>
        </div>
    );
};

export default SearchBuilder;
