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
import { User, Project, TimeEntry, ChatMessage, TaskStatus } from '../types';

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
  subscribeProjects: (callback: (projects: Project[]) => void) => {
    if (!db) return () => {};
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(mapDoc) as Project[];
      callback(projects);
    }, (error) => {
        if (error.code !== 'permission-denied') {
             console.warn("Firestore Listener Error (Projects):", error.message);
        }
    });
  },

  createProject: async (project: Project) => {
    if (!db) return;
    const { id, ...data } = project;
    await addDoc(collection(db, 'projects'), deepSanitize(data));
  },

  updateProject: async (project: Project) => {
    if (!db) throw new Error("Database not initialized");
    if (!project.id) throw new Error("Project ID missing for update");
    
    try {
        const projectRef = doc(db, 'projects', project.id);
        const { id, ...data } = project;
        // Use deepSanitize to ensure tasks array doesn't contain undefined fields
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
  subscribeTimeEntries: (callback: (entries: TimeEntry[]) => void) => {
    if (!db) return () => {};
    const q = query(collection(db, 'time_entries'), orderBy('timestamp', 'desc'), limit(100));
    
    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(mapDoc) as TimeEntry[];
      callback(entries);
    }, (error) => {
        if (error.code !== 'permission-denied') {
            console.warn("Firestore Listener Error (TimeEntries):", error.message);
        }
    });
  },

  saveTimeEntry: async (entry: TimeEntry) => {
    if (!db) return;
    const { id, ...data } = entry;
    await addDoc(collection(db, 'time_entries'), deepSanitize(data));
  },

  // --- CHAT ---
  subscribeChat: (projectId: string, callback: (messages: ChatMessage[]) => void, onError?: (error: any) => void) => {
    if (!db) return () => {};
    
    const q = query(
        collection(db, 'chat'), 
        where('projectId', '==', projectId),
        orderBy('timestamp', 'asc'), 
        limit(100)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(mapDoc) as ChatMessage[];
      callback(messages);
    }, (error) => {
         if (onError) onError(error);
         if (error.code !== 'permission-denied') {
            console.warn("Firestore Listener Error (Chat):", error.message);
         }
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
  }
};