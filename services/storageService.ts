import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User, Project, TimeEntry, ChatMessage, TaskStatus, Company, Transaction, UserPermissions } from '../types';

// Convert Firebase Snapshots to our Types
const mapDoc = (doc: any) => ({ id: doc.id, ...doc.data() });

// Helper to remove undefined fields recursively (Deep Sanitize)
// Firestore crashes if ANY nested field is undefined.
const deepSanitize = (obj: any): any => {
  if (obj === null || obj === undefined) return null;

  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = deepSanitize(value);
      }
      return acc;
    }, {} as any);
  }

  return obj;
};

export const storageService = {
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
      // Simple random 6-character code (uppercase alphanumeric)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      company.inviteCode = code;
    }

    // If ID is empty, let Firestore generate one
    let ref;
    if (!company.id) {
      ref = await addDoc(collection(db, 'companies'), deepSanitize(company));
      // Update the document with its own ID
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

  // --- SUPER ADMIN METHODS ---
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

  deleteCompany: async (companyId: string): Promise<void> => {
    if (!db) return;
    try {
      // 1. Delete Company Document
      await deleteDoc(doc(db, 'companies', companyId));

      // 2. Find and Delete All Users of this Company
      const usersQ = query(collection(db, 'users'), where('companyId', '==', companyId));
      const usersSnap = await getDocs(usersQ);
      const userDeletes = usersSnap.docs.map(d => deleteDoc(doc(db, 'users', d.id)));

      // 3. Find and Delete All Projects of this Company
      const projectsQ = query(collection(db, 'projects'), where('companyId', '==', companyId));
      const projectsSnap = await getDocs(projectsQ);
      const projectDeletes = projectsSnap.docs.map(d => deleteDoc(doc(db, 'projects', d.id)));

      // Execute deletions in parallel
      await Promise.all([...userDeletes, ...projectDeletes]);
      console.log(`Company ${companyId} and related data deleted.`);
    } catch (error) {
      console.error("Error deleting company and cascading data:", error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    if (!db) return;
    await deleteDoc(doc(db, 'users', userId));
  },

  resetDatabase: async (): Promise<void> => {
    if (!db) return;
    try {
      // 1. Delete All Companies
      const companiesSnap = await getDocs(collection(db, 'companies'));
      const companyDeletes = companiesSnap.docs.map(d => deleteDoc(doc(db, 'companies', d.id)));

      // 2. Delete All Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const userDeletes = usersSnap.docs.map(d => deleteDoc(doc(db, 'users', d.id)));

      // 3. Delete All Projects (Cleanup)
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const projectDeletes = projectsSnap.docs.map(d => deleteDoc(doc(db, 'projects', d.id)));

      // Execute all deletions
      await Promise.all([...companyDeletes, ...userDeletes, ...projectDeletes]);
      console.log("DATABASE RESET COMPLETE");
    } catch (error) {
      console.error("Error resetting database:", error);
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
      if (error.code === 'permission-denied') {
        throw error;
      }
      console.warn("Error fetching user:", error);
      return null;
    }
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

  // --- PROJECTS (Kanban) ---
  subscribeProjects: (companyId: string, callback: (projects: Project[]) => void) => {
    if (!db || !companyId) return () => { };
    // Filter by companyId ONLY to avoid composite index requirement
    const q = query(
      collection(db, 'projects'),
      where('companyId', '==', companyId)
    );

    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(mapDoc) as Project[];
      // Client-side Sort: CreatedAt Ascending
      projects.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      callback(projects);
    }, (error) => {
      console.warn("Firestore Listener Error (Projects):", error.message);
    });
  },

  createProject: async (project: Project): Promise<string> => {
    if (!db) return '';
    const { id, ...data } = project;
    const ref = await addDoc(collection(db, 'projects'), deepSanitize(data));
    // Asynchronously update the document with its ID
    setDoc(doc(db, 'projects', ref.id), { id: ref.id }, { merge: true });
    return ref.id;
  },

  updateProject: async (project: Project) => {
    if (!db) throw new Error("Database not initialized");
    if (!project.id) throw new Error("Project ID missing for update");

    try {
      const projectRef = doc(db, 'projects', project.id);
      const { id, ...data } = project;
      await setDoc(projectRef, deepSanitize(data), { merge: true });
      console.log("Project updated successfully:", project.id);
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    if (!db) throw new Error("Database not initialized");
    if (!projectId) throw new Error("Project ID missing for deletion");

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      console.log("Project deleted successfully:", projectId);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  // --- TIME ENTRIES ---
  subscribeTimeEntries: (companyId: string, callback: (entries: TimeEntry[]) => void) => {
    if (!db || !companyId) return () => { };
    // Remove orderBy to avoid index issues
    const q = query(
      collection(db, 'time_entries'),
      where('companyId', '==', companyId)
    );

    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(mapDoc) as TimeEntry[];
      // Client-side Sort: Timestamp Descending
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      // Client-side Limit: Take top 100
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

  // --- CHAT ---
  subscribeChat: (companyId: string, projectId: string, callback: (messages: ChatMessage[]) => void, onError?: (error: any) => void) => {
    if (!db || !companyId) return () => { };

    // Simply filter by parent IDs, avoid complex Sorts in Query
    const constraints = [
      where('companyId', '==', companyId),
      where('projectId', '==', projectId)
    ];

    const q = query(collection(db, 'chat'), ...constraints);

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(mapDoc) as ChatMessage[];
      // Client-side Sort: Timestamp Ascending
      messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      // Limit logic can be applied here if array gets too big, but for chat usually we want history
      // Let's keep last 100 for performance safety if needed, or all.
      // For now, let's keep all to ensure context, or cap at 100.
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

  saveChatMessage: async (msg: ChatMessage) => {
    if (!db) return;
    const { id, ...data } = msg;
    await addDoc(collection(db, 'chat'), deepSanitize(data));
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
  },

  // --- FINANCES ---
  subscribeTransactions: (companyId: string, callback: (transactions: Transaction[]) => void) => {
    if (!db || !companyId) return () => { };
    const q = query(
      collection(db, 'transactions'),
      where('companyId', '==', companyId)
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(mapDoc) as Transaction[];
      // Client-side Sort: Date Descending (Newest first)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(transactions);
    }, (error) => {
      console.warn("Firestore Listener Error (Transactions):", error.message);
    });
  },

  saveTransaction: async (transaction: Transaction) => {
    if (!db) return;
    const { id, ...data } = transaction;
    await addDoc(collection(db, 'transactions'), deepSanitize(data));
  },

  updateTransaction: async (transaction: Transaction) => {
    if (!db) return;
    if (!transaction.id) return;
    const ref = doc(db, 'transactions', transaction.id);
    const { id, ...data } = transaction;
    await setDoc(ref, deepSanitize(data), { merge: true });
  },

  deleteTransaction: async (transactionId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'transactions', transactionId));
  },

  // --- TEAM MANAGEMENT ---
  subscribeCompanyUsers: (companyId: string, callback: (users: User[]) => void) => {
    if (!db || !companyId) return () => { };
    const q = query(
      collection(db, 'users'),
      where('companyId', '==', companyId)
    );

    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(mapDoc) as User[];
      callback(users);
    }, (error) => {
      console.warn("Firestore Listener Error (Company Users):", error.message);
    });
  },

  updateUserPermissions: async (userId: string, permissions: UserPermissions) => {
    if (!db) return;
    const ref = doc(db, 'users', userId);
    await setDoc(ref, { permissions: deepSanitize(permissions) }, { merge: true });
  },

  getCompanyProjects: async (companyId: string): Promise<Project[]> => {
    if (!db) return [];
    const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc) as Project[];
  }
};