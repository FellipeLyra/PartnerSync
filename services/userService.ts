import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
    setDoc,
    getDoc,
    limit
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, Company, UserPermissions } from '../types';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const userService = {
    // --- COMPANIES ---
    getCompany: async (companyId: string): Promise<Company | null> => {
        if (!db || !companyId) return null;
        try {
            const snap = await getDoc(doc(db, 'companies', companyId));
            if (snap.exists()) {
                const data = snap.data() as Company;
                // BACKFILL: If old company has no invite code, generate one now
                if (!data.inviteCode) {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let code = '';
                    for (let i = 0; i < 6; i++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    data.inviteCode = code;
                    // Update DB asynchronously
                    setDoc(doc(db, 'companies', companyId), { inviteCode: code }, { merge: true });
                }
                return { id: snap.id, ...data };
            }
            return null;
        } catch (e) {
            console.error("Error getting company:", e);
            return null;
        }
    },

    createCompany: async (company: Company): Promise<string> => {
        if (!db) return '';

        // Generate Invite Code if missing
        if (!company.inviteCode) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            company.inviteCode = code;
        }

        // If ID is empty, let Firestore generate one
        if (!company.id) {
            const ref = await addDoc(collection(db, 'companies'), deepSanitize(company));
            await setDoc(doc(db, 'companies', ref.id), { id: ref.id }, { merge: true });
            return ref.id;
        } else {
            await setDoc(doc(db, 'companies', company.id), deepSanitize(company));
            return company.id;
        }
    },

    getCompanyByInviteCode: async (code: string): Promise<Company | null> => {
        if (!db) return null;
        try {
            const q = query(collection(db, 'companies'), where('inviteCode', '==', code.toUpperCase()), limit(1));
            const snap = await getDocs(q);
            if (snap.empty) return null;
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as Company;
        } catch (error) {
            console.error("Error finding company by invite code:", error);
            return null;
        }
    },

    getAllCompanies: async (): Promise<Company[]> => {
        if (!db) return [];
        try {
            const snap = await getDocs(collection(db, 'companies'));
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
        } catch (error) {
            console.error("Error getting all companies:", error);
            return [];
        }
    },

    deleteCompany: async (companyId: string): Promise<void> => {
        if (!db) return;
        try {
            await deleteDoc(doc(db, 'companies', companyId));

            // Cascade delete users and projects handled in respective services or here if strictly hierarchical?
            // Logic from storageService.ts implies storageService knew about everything.
            // We will keep the logic here for now, but strictly we should probably query those collections.
            // Ideally, specific services handle their own cleanups, but for now reproducing logic:

            const usersQ = query(collection(db, 'users'), where('companyId', '==', companyId));
            const usersSnap = await getDocs(usersQ);
            const userDeletes = usersSnap.docs.map(d => deleteDoc(doc(db, 'users', d.id)));

            const projectsQ = query(collection(db, 'projects'), where('companyId', '==', companyId));
            const projectsSnap = await getDocs(projectsQ);
            const projectDeletes = projectsSnap.docs.map(d => deleteDoc(doc(db, 'projects', d.id)));

            await Promise.all([...userDeletes, ...projectDeletes]);
            console.log(`Company ${companyId} and related data deleted.`);
        } catch (error) {
            console.error("Error deleting company and cascading data:", error);
            throw error;
        }
    },

    // --- USERS ---
    getUser: async (userId: string): Promise<User | null> => {
        if (!db) return null;
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                return { id: userSnap.id, ...userSnap.data() } as User;
            }
            return null;
        } catch (error: any) {
            if (error.code === 'permission-denied') throw error;
            console.warn("Error fetching user:", error);
            return null;
        }
    },

    getAllUsers: async (): Promise<User[]> => {
        if (!db) return [];
        try {
            const snap = await getDocs(collection(db, 'users'));
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        } catch (error) {
            console.error("Error getting all users:", error);
            return [];
        }
    },

    subscribeCompanyUsers: (companyId: string, callback: (users: User[]) => void) => {
        if (!db || !companyId) return () => { };
        const q = query(collection(db, 'users'), where('companyId', '==', companyId));
        return onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(mapDoc) as User[];
            callback(users);
        }, (error) => {
            console.warn("Error subscribing to users:", error);
        });
    },

    saveUser: async (user: User) => {
        if (!db) return;
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, deepSanitize(user), { merge: true });
    },

    updateUser: async (user: User) => {
        if (!db) return;
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, deepSanitize({ ...user }), { merge: true });
    },

    deleteUser: async (userId: string): Promise<void> => {
        if (!db) return;
        await deleteDoc(doc(db, 'users', userId));
    },

    updateUserPermissions: async (userId: string, permissions: UserPermissions) => {
        if (!db) return;
        const ref = doc(db, 'users', userId);
        await setDoc(ref, { permissions: deepSanitize(permissions) }, { merge: true });
    }
};
