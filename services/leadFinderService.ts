import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { SavedSearch, SearchRun, LeadCandidate, Client } from '../types';
import { crmService } from './crmService';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const leadFinderService = {
    /**
     * Saves a new search configuration
     */
    saveSearch: async (search: Omit<SavedSearch, 'id' | 'createdAt'>) => {
        if (!db) return;
        const newSearch = {
            ...search,
            createdAt: Date.now(),
            lastRun: 0
        };
        const ref = await addDoc(collection(db, 'saved_searches'), deepSanitize(newSearch));
        return ref.id;
    },

    /**
     * Updates an existing search
     */
    updateSearch: async (id: string, search: Partial<SavedSearch>) => {
        if (!db) return;
        const ref = doc(db, 'saved_searches', id);
        await updateDoc(ref, deepSanitize(search));
    },

    /**
     * Deletes a search
     */
    deleteSearch: async (id: string) => {
        if (!db) return;
        const ref = doc(db, 'saved_searches', id);
        await deleteDoc(ref);
    },

    /**
     * Get saved searches for a company
     */
    getSavedSearches: async (companyId: string): Promise<SavedSearch[]> => {
        if (!db) return [];
        const q = query(collection(db, 'saved_searches'), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        return snap.docs.map(mapDoc) as SavedSearch[];
    },

    /**
     * Deduplicates candidates against existing CRM clients
     * Criteria: Phone matches OR Website domain matches OR Name (exact)
     */
    /**
     * Deduplicates candidates against existing CRM clients
     * Criteria: Phone matches OR Website domain matches OR Name (exact)
     */
    deduplicateCandidates: async (companyId: string, candidates: LeadCandidate[]): Promise<LeadCandidate[]> => {
        if (!db) return candidates;

        const q = query(collection(db, 'clients'), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        const clients = snap.docs.map(d => ({ ...d.data(), id: d.id })) as Client[];

        // Normalize helper
        const normalize = (str?: string) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
        const getDomain = (url?: string) => {
            if (!url) return '';
            try {
                return new URL(url.startsWith('http') ? url : `http://${url}`).hostname.replace('www.', '');
            } catch (e) { return ''; }
        };

        // Maps for O(1) lookup: Key -> ClientID
        const phoneMap = new Map<string, string>();
        const domainMap = new Map<string, string>();
        const nameMap = new Map<string, string>();

        clients.forEach(c => {
            const p = normalize(c.phone);
            if (p.length > 5) phoneMap.set(p, c.id);

            const d = getDomain(c.website);
            if (d.length > 3) domainMap.set(d, c.id);

            nameMap.set(normalize(c.name), c.id);
        });

        return candidates.map(candidate => {
            const candPhone = normalize(candidate.phone);
            const candDomain = getDomain(candidate.website);
            const candName = normalize(candidate.name);

            if (candPhone && phoneMap.has(candPhone)) {
                return { ...candidate, status: 'DUPLICATE', duplicateReason: 'Telefone já existe', matchedClientId: phoneMap.get(candPhone) };
            }
            if (candDomain && domainMap.has(candDomain)) {
                return { ...candidate, status: 'DUPLICATE', duplicateReason: 'Website já existe', matchedClientId: domainMap.get(candDomain) };
            }
            if (candName && nameMap.has(candName)) {
                return { ...candidate, status: 'DUPLICATE', duplicateReason: 'Nome já existe', matchedClientId: nameMap.get(candName) };
            }

            return { ...candidate, status: 'NEW' };
        });
    },

    /**
     * Logs a search run execution
     */
    logRun: async (run: Omit<SearchRun, 'id'>) => {
        if (!db) return;
        await addDoc(collection(db, 'search_runs'), deepSanitize(run));
        // Update lastRun in saved_searches
        if (run.searchId) {
            const searchRef = doc(db, 'saved_searches', run.searchId);
            await updateDoc(searchRef, { lastRun: run.date });
        }
    },

    /**
     * Import selected candidates to CRM
     * Can also update existing clients if matchedClientId is present
     */
    importCandidates: async (companyId: string, candidates: LeadCandidate[]) => {
        const importedIds: string[] = [];

        for (const cand of candidates) {
            // Case 1: Update existing
            if (cand.matchedClientId) {
                try {
                    const clientRef = doc(db, 'clients', cand.matchedClientId);
                    // Only update fields that are present in candidate
                    const updates: any = {};
                    if (cand.instagram) updates.role = cand.instagram;
                    if (cand.website) updates.linkedinProfile = cand.website;

                    if (Object.keys(updates).length > 0) {
                        await updateDoc(clientRef, deepSanitize(updates));
                    }
                    importedIds.push(cand.matchedClientId);
                } catch (e) {
                    console.error("Failed to update client", cand.matchedClientId, e);
                }
                continue;
            }

            // Case 2: Create New
            if (cand.status !== 'NEW') continue;

            const newClient: Client = {
                id: '',
                companyId,
                name: cand.name,
                organizationName: cand.name,
                email: '', // OSM usually doesn't have email
                phone: cand.phone,
                role: cand.instagram || '', // Map Instagram to Role field for display
                linkedinProfile: cand.website, // Map Website to LinkedIn for display
                leadSource: 'Lead Finder (OSM)',
                tags: ['Lead Finder', ...Object.keys(cand.osmTags || {}).slice(0, 3)], // Take top 3 OSM tags
                notes: `Importado do OpenStreetMap.\nEndereço: ${cand.address || 'N/A'}\nCidade: ${cand.city || 'N/A'}\nWebsite: ${cand.website || 'N/A'}\nOSM ID: ${cand.id}`,
                website: cand.website,
                address: cand.address,
                createdAt: Date.now()
            } as Client;

            const id = await crmService.saveClient(newClient);
            if (id) importedIds.push(id);
        }
        return importedIds;
    }
};
