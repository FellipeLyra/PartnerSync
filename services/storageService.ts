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
import { User, Project, TimeEntry, ChatMessage, TaskStatus, Company, Transaction, UserPermissions, Client, Deal } from '../types';

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

  cleanupDoneTasks: async (companyId: string): Promise<void> => {
    if (!db || !companyId) return;
    try {
      const now = new Date();
      // Brasilia Time "dd/mm/yyyy"
      const todayBrasilia = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

      const lastCleanup = localStorage.getItem(`lastDoneCleanup_${companyId}`);

      if (lastCleanup === todayBrasilia) {
        console.log('Auto-cleanup already executed today:', todayBrasilia);
        return;
      }

      console.log('Executing daily cleanup of DONE tasks...');
      const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];

      let updates = 0;

      for (const project of projects) {
        if (!project.tasks || project.tasks.length === 0) continue;

        const originalCount = project.tasks.length;
        // Filter out tasks that are DONE
        const activeTasks = project.tasks.filter(t => t.status !== 'DONE');

        if (activeTasks.length < originalCount) {
          const projectRef = doc(db, 'projects', project.id);
          // We must update the tasks array directly
          await setDoc(projectRef, { tasks: deepSanitize(activeTasks) }, { merge: true });
          updates++;
        }
      }

      console.log(`Cleanup complete. Updated ${updates} projects.`);
      localStorage.setItem(`lastDoneCleanup_${companyId}`, todayBrasilia);
    } catch (error) {
      console.error("Error executing cleanup:", error);
    }
  },

  cleanupMonthlyTimeEntries: async (companyId: string): Promise<void> => {
    if (!db || !companyId) return;
    try {
      const now = new Date();
      // Brasilia Time Month check (e.g., "01/2026")
      const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' } as const;
      const currentMonthStr = now.toLocaleDateString('pt-BR', options);

      const lastCleanupMonth = localStorage.getItem(`lastMonthlyReset_${companyId}`);

      // If we haven't stored a cleanup month, or it's different from current, trigger check
      if (lastCleanupMonth !== currentMonthStr) {
        console.log('New Month Detected! Checking for old entries cleanup...', currentMonthStr);

        // Query all entries for company
        const q = query(collection(db, 'time_entries'), where('companyId', '==', companyId));
        const snapshot = await getDocs(q);

        // Define "Start of Current Month" in Brasilia Time
        // We want to KEEP entries from THIS month. Delete entries from PREVIOUS months.

        // Helper to get Year/Month of an entry in Brasilia Time
        const getBrasiliaMonth = (date: Date) => {
          return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' });
        };

        const deletePromises = snapshot.docs.map(doc => {
          const data = doc.data() as TimeEntry;
          const entryDate = new Date(data.timestamp);
          const entryMonth = getBrasiliaMonth(entryDate);

          // If entry month is NOT current month, delete it
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
  },

  // --- AI HELPERS ---

  // Tasks
  // Tasks
  addTaskToProject: async (companyId: string, taskTitle: string, columnName: string = 'TODO', targetProjectName?: string) => {
    if (!db) return;

    let project: Project | null = null;
    let projects: Project[] = [];

    // 1. Fetch available projects
    // We intentionally fetch all (assuming small number) to handle name matching better in JS
    const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    projects = snap.docs.map(mapDoc) as Project[];

    if (projects.length === 0) {
      throw new Error("Nenhum projeto encontrado.");
    }

    // 2. Find Target Project
    if (targetProjectName) {
      const lowerTarget = targetProjectName.toLowerCase();
      project = projects.find(p => p.name.toLowerCase().includes(lowerTarget)) || null;
    }

    // Fallback if not found or not specified: Use 'Geral' or first available
    if (!project) {
      // If specific target requested but not found, stick to first one but maybe we should warn?
      // Ideally we pick 'Geral' if exists, otherwise first.
      project = projects.find(p => p.name.toLowerCase() === 'geral') || projects[0];
    }

    // 3. Resolve Column/Status
    // Map common input terms to internal IDs
    let statusId = 'TODO'; // Default
    const lowerCol = columnName.toLowerCase();

    if (lowerCol.includes('doing') || lowerCol.includes('progresso') || lowerCol.includes('fazendo')) {
      statusId = 'DOING';
    } else if (lowerCol.includes('done') || lowerCol.includes('conclu') || lowerCol.includes('feito')) {
      statusId = 'DONE';
    } else {
      statusId = 'TODO'; // 'to do', 'a fazer', 'pendente' -> TODO
    }

    // Check if project has custom columns with matching ID or Title
    if (project.columns && project.columns.length > 0) {
      const customCol = project.columns.find(c =>
        c.id.toLowerCase() === lowerCol ||
        c.title.toLowerCase().includes(lowerCol)
      );
      if (customCol) {
        statusId = customCol.id;
      } else {
        // Validate if our mapped statusId exists in custom columns. 
        // If the project uses completely custom IDs (e.g. 'col-123'), 'TODO' might be invalid.
        // Safe fallback: use the first column.
        const hasDefault = project.columns.some(c => c.id === statusId);
        if (!hasDefault) {
          statusId = project.columns[0].id;
        }
      }
    }

    // 4. Add Task
    const newTask = {
      id: Date.now().toString(),
      content: taskTitle,
      description: '',
      status: statusId,
      assignee: 'AI',
      priority: 'MEDIUM',
      dueDate: new Date().toISOString(),
      createdAt: Date.now()
    };

    const currentTasks = project.tasks || [];
    const updatedTasks = [...currentTasks, newTask];

    await setDoc(doc(db, 'projects', project.id), { tasks: updatedTasks }, { merge: true });
    return project.name;
  },

  // Finance Report
  getFinancialReport: async (companyId: string): Promise<string> => {
    if (!db) return "Erro DB";

    // Get transactions for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const q = query(collection(db, 'transactions'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    const transactions = snap.docs.map(mapDoc) as Transaction[];

    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    const filtered = transactions.filter(t => t.date.startsWith(currentMonth));

    const income = filtered
      .filter(t => t.type === 'INCOME' && t.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const expense = filtered
      .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = income - expense;

    const pending = filtered
      .filter(t => t.status === 'PENDING' || t.status === 'OVERDUE')
      .reduce((acc, curr) => acc + (curr.type === 'INCOME' ? curr.amount : -curr.amount), 0);

    return `Relatório Financeiro (${currentMonth}):
     - Receitas (Pagas): R$ ${income.toFixed(2)}
     - Despesas (Pagas): R$ ${expense.toFixed(2)}
     - Saldo Líquido: R$ ${balance.toFixed(2)}
     - Pendente: R$ ${pending.toFixed(2)}`;
  },

  // CRM Helpers
  getClientByName: async (companyId: string, name: string): Promise<Client | null> => {
    if (!db) return null;
    // Firestore doesn't support "contains" directly. We fetch all for company and filter in JS (assuming reasonable client count)
    // Or we rely on exact match? Let's try partial match in JS for better UX.
    const q = query(collection(db, 'clients'), where('companyId', '==', companyId));
    const snap = await getDocs(q);
    const clients = snap.docs.map(mapDoc) as Client[];

    // Find best match
    const match = clients.find(c => c.name.toLowerCase().includes(name.toLowerCase()) ||
      (c.organizationName && c.organizationName.toLowerCase().includes(name.toLowerCase())));
    return match || null;
  },

  addDeal: async (companyId: string, deal: Partial<Deal>) => {
    if (!db) return;

    // Default to 'PROSPECT' as defined in PipelineBoard.tsx
    let stageId = 'PROSPECT';

    // Map text stages from AI to internal IDs if provided
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
  }
};