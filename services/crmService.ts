import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Client, Deal, Interaction, ClientMessage } from '../types';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const crmService = {
    // --- CLIENTS ---
    subscribeClients: (companyId: string, callback: (clients: Client[]) => void) => {
        if (!db || !companyId) return () => { };
        const q = query(collection(db, 'clients'), where('companyId', '==', companyId));
        return onSnapshot(q, (snapshot) => {
            const clients = snapshot.docs.map(mapDoc) as Client[];
            clients.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(clients);
        }, (error) => console.warn("Firestore Error (Clients):", error));
    },

    saveClient: async (client: Client): Promise<string> => {
        if (!db) return '';
        const { id, ...data } = client;
        if (!id) {
            const ref = await addDoc(collection(db, 'clients'), deepSanitize(data));
            await setDoc(doc(db, 'clients', ref.id), { id: ref.id }, { merge: true });
            return ref.id;
        } else {
            await setDoc(doc(db, 'clients', id), deepSanitize(data), { merge: true });
            return id;
        }
    },

    getClientByName: async (companyId: string, name: string): Promise<Client | null> => {
        if (!db) return null;
        const q = query(collection(db, 'clients'), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        const clients = snap.docs.map(mapDoc) as Client[];

        const match = clients.find(c => c.name.toLowerCase().includes(name.toLowerCase()) ||
            (c.organizationName && c.organizationName.toLowerCase().includes(name.toLowerCase())));
        return match || null;
    },

    deleteClient: async (clientId: string) => {
        if (!db) return;

        try {
            // Cascade Delete
            const messagesQ = query(collection(db, 'client_messages'), where('clientId', '==', clientId));
            const messagesSnap = await getDocs(messagesQ);
            const msgDeletes = messagesSnap.docs.map(d => deleteDoc(doc(db, 'client_messages', d.id)));

            const interactionsQ = query(collection(db, 'interactions'), where('clientId', '==', clientId));
            const interactionsSnap = await getDocs(interactionsQ);
            const interactionDeletes = interactionsSnap.docs.map(d => deleteDoc(doc(db, 'interactions', d.id)));

            const dealsQ = query(collection(db, 'deals'), where('clientId', '==', clientId));
            const dealsSnap = await getDocs(dealsQ);
            const dealDeletes = dealsSnap.docs.map(d => deleteDoc(doc(db, 'deals', d.id)));

            await Promise.all([...msgDeletes, ...interactionDeletes, ...dealDeletes]);
            await deleteDoc(doc(db, 'clients', clientId));
        } catch (error) {
            console.error("Error deleting client and related data:", error);
            throw error;
        }
    },

    // --- DEALS (Sales Pipeline) ---
    subscribeDeals: (companyId: string, callback: (deals: Deal[]) => void) => {
        if (!db || !companyId) return () => { };
        const q = query(collection(db, 'deals'), where('companyId', '==', companyId));
        return onSnapshot(q, (snapshot) => {
            const deals = snapshot.docs.map(mapDoc) as Deal[];
            callback(deals);
        }, (error) => console.warn("Firestore Error (Deals):", error));
    },

    saveDeal: async (deal: Deal): Promise<string> => {
        if (!db) return '';
        const { id, ...data } = deal;
        const payload = deepSanitize({ ...data, updatedAt: Date.now() });

        if (!id) {
            const ref = await addDoc(collection(db, 'deals'), payload);
            await setDoc(doc(db, 'deals', ref.id), { id: ref.id }, { merge: true });
            return ref.id;
        } else {
            await setDoc(doc(db, 'deals', id), payload, { merge: true });
            return id;
        }
    },

    addDeal: async (companyId: string, deal: Partial<Deal>) => {
        if (!db) return;

        let stageId = 'PROSPECT';
        if (deal.stageId) {
            const lower = deal.stageId.toLowerCase();
            if (lower.includes('quali')) stageId = 'QUALIFICATION';
            else if (lower.includes('prop')) stageId = 'PROPOSAL';
            else if (lower.includes('negoc')) stageId = 'NEGOTIATION';
            else if (lower.includes('ganho') || lower.includes('fech')) stageId = 'WON';
            else if (lower.includes('perd')) stageId = 'LOST';
            else stageId = 'PROSPECT';
        }

        const newDeal: Deal = {
            id: '',
            companyId,
            clientId: deal.clientId!,
            title: deal.title || 'Nova Oportunidade',
            value: deal.value || 0,
            stageId: stageId,
            probability: deal.probability || 50,
            status: 'OPEN',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...deal
        } as Deal;

        const { id, ...data } = newDeal;
        await addDoc(collection(db, 'deals'), deepSanitize(data));
        return newDeal.title;
    },

    deleteDeal: async (dealId: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'deals', dealId));
    },

    // --- INTERACTIONS (Timeline) ---
    subscribeInteractions: (companyId: string, clientId: string, callback: (interactions: Interaction[]) => void) => {
        if (!db || !companyId || !clientId) return () => { };
        const q = query(
            collection(db, 'interactions'),
            where('companyId', '==', companyId),
            where('clientId', '==', clientId)
        );
        return onSnapshot(q, (snapshot) => {
            const interactions = snapshot.docs.map(mapDoc) as Interaction[];
            interactions.sort((a, b) => b.date - a.date);
            callback(interactions);
        }, (error) => console.warn("Firestore Error (Interactions):", error));
    },

    logInteraction: async (interaction: Interaction) => {
        if (!db) return;
        const { id, ...data } = interaction;
        await addDoc(collection(db, 'interactions'), deepSanitize(data));
    },

    // --- MESSAGES (WhatsApp/Chat) ---
    subscribeMessages: (companyId: string, clientId: string, callback: (messages: ClientMessage[]) => void) => {
        if (!db || !companyId || !clientId) return () => { };
        const q = query(
            collection(db, 'client_messages'),
            where('companyId', '==', companyId),
            where('clientId', '==', clientId)
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(mapDoc) as ClientMessage[];
            messages.sort((a, b) => a.timestamp - b.timestamp);
            callback(messages);
        }, (error) => console.warn("Firestore Error (Messages):", error));
    },

    sendMessage: async (message: ClientMessage) => {
        if (!db) return;
        const { id, ...data } = message;
        await addDoc(collection(db, 'client_messages'), deepSanitize(data));
    }
};
