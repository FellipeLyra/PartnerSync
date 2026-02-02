import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    setDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ChatMessage } from '../types';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const chatService = {
    subscribeChat: (companyId: string, projectId: string, callback: (messages: ChatMessage[]) => void, onError?: (error: any) => void) => {
        if (!db || !companyId) return () => { };

        const constraints = [
            where('companyId', '==', companyId),
            where('projectId', '==', projectId)
        ];

        const q = query(collection(db, 'chat'), ...constraints);

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(mapDoc) as ChatMessage[];
            messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

            if (messages.length > 200) {
                callback(messages.slice(messages.length - 200));
            } else {
                callback(messages);
            }
        }, (error) => {
            if (onError) onError(error);
            console.warn("Firestore Listener Error (Chat):", error.message);
        });
    },

    saveChatMessage: async (msg: ChatMessage): Promise<string> => {
        if (!db) return '';
        const { id, ...data } = msg;
        const ref = await addDoc(collection(db, 'chat'), deepSanitize(data));
        setDoc(doc(db, 'chat', ref.id), { id: ref.id }, { merge: true });
        return ref.id;
    },

    updateChatMessage: async (msg: ChatMessage) => {
        if (!db) return;
        if (!msg.id) return;
        const msgRef = doc(db, 'chat', msg.id);
        await setDoc(msgRef, deepSanitize(msg), { merge: true });
    },

    deleteChatMessage: async (msgId: string) => {
        if (!db) return;
        await deleteDoc(doc(db, 'chat', msgId));
    }
};
