import {
    collection,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { TimeEntry } from '../types';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const timeService = {
    subscribeTimeEntries: (companyId: string, callback: (entries: TimeEntry[]) => void) => {
        if (!db || !companyId) return () => { };
        const q = query(
            collection(db, 'time_entries'),
            where('companyId', '==', companyId)
        );

        return onSnapshot(q, (snapshot) => {
            const entries = snapshot.docs.map(mapDoc) as TimeEntry[];
            entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            callback(entries.slice(0, 100));
        }, (error) => {
            console.warn("Firestore Listener Error (TimeEntries):", error.message);
        });
    },

    saveTimeEntry: async (entry: TimeEntry) => {
        if (!db) return;
        const { id, ...data } = entry;
        await addDoc(collection(db, 'time_entries'), deepSanitize(data));
    },

    cleanupMonthlyTimeEntries: async (companyId: string): Promise<void> => {
        if (!db || !companyId) return;
        try {
            const now = new Date();
            const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' } as const;
            const currentMonthStr = now.toLocaleDateString('pt-BR', options);
            const lastCleanupMonth = localStorage.getItem(`lastMonthlyReset_${companyId}`);

            if (lastCleanupMonth !== currentMonthStr) {
                console.log('New Month Detected! Checking for old entries cleanup...', currentMonthStr);

                const q = query(collection(db, 'time_entries'), where('companyId', '==', companyId));
                const snapshot = await getDocs(q);

                const getBrasiliaMonth = (date: Date) => {
                    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' });
                };

                const deletePromises = snapshot.docs.map(doc => {
                    const data = doc.data() as TimeEntry;
                    const entryDate = new Date(data.timestamp);
                    const entryMonth = getBrasiliaMonth(entryDate);

                    if (entryMonth !== currentMonthStr) {
                        return deleteDoc(doc.ref);
                    }
                    return Promise.resolve();
                });

                await Promise.all(deletePromises);
                console.log('Monthly history cleanup complete.');
                localStorage.setItem(`lastMonthlyReset_${companyId}`, currentMonthStr);
            }
        } catch (error) {
            console.error("Error cleaning old time entries:", error);
        }
    }
};
