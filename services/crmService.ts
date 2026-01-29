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

// Reuse helper from storageService (in a real scenario, we'd export it, but for now duplicate for safety/speed)
const mapDoc = (doc: any) => ({ id: doc.id, ...doc.data() });

const deepSanitize = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
    if (typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = deepSanitize(value);
            return acc;
        }, {} as any);
    }
    return obj;
};

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

    deleteClient: async (clientId: string) => {
        if (!db) return;

        try {
            // Cascade Delete: Messages
            const messagesQ = query(collection(db, 'client_messages'), where('clientId', '==', clientId));
            const messagesSnap = await getDocs(messagesQ);
            const msgDeletes = messagesSnap.docs.map(d => deleteDoc(doc(db, 'client_messages', d.id)));

            // Cascade Delete: Interactions
            const interactionsQ = query(collection(db, 'interactions'), where('clientId', '==', clientId));
            const interactionsSnap = await getDocs(interactionsQ);
            const interactionDeletes = interactionsSnap.docs.map(d => deleteDoc(doc(db, 'interactions', d.id)));

            // Cascade Delete: Deals
            const dealsQ = query(collection(db, 'deals'), where('clientId', '==', clientId));
            const dealsSnap = await getDocs(dealsQ);
            const dealDeletes = dealsSnap.docs.map(d => deleteDoc(doc(db, 'deals', d.id)));

            // Execute all deletions related to client
            await Promise.all([...msgDeletes, ...interactionDeletes, ...dealDeletes]);

            // Finally delete the client
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
            interactions.sort((a, b) => b.date - a.date); // Newest first
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
            messages.sort((a, b) => a.timestamp - b.timestamp); // Chronological order
            callback(messages);
        }, (error) => console.warn("Firestore Error (Messages):", error));
    },

    sendMessage: async (message: ClientMessage) => {
        if (!db) return;
        const { id, ...data } = message;
        await addDoc(collection(db, 'client_messages'), deepSanitize(data));
    }
};
