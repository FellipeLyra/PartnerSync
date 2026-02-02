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
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Project } from '../types';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const projectService = {
    subscribeProjects: (companyId: string, callback: (projects: Project[]) => void) => {
        if (!db || !companyId) return () => { };
        const q = query(
            collection(db, 'projects'),
            where('companyId', '==', companyId)
        );

        return onSnapshot(q, (snapshot) => {
            const projects = snapshot.docs.map(mapDoc) as Project[];
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

    getCompanyProjects: async (companyId: string): Promise<Project[]> => {
        if (!db) return [];
        const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        return snap.docs.map(mapDoc) as Project[];
    },

    cleanupDoneTasks: async (companyId: string): Promise<void> => {
        if (!db || !companyId) return;
        try {
            const now = new Date();
            const todayBrasilia = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            const lastCleanup = localStorage.getItem(`lastDoneCleanup_${companyId}`);

            if (lastCleanup === todayBrasilia) return;

            console.log('Executing daily cleanup of DONE tasks...');
            const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
            const snapshot = await getDocs(q);
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];

            let updates = 0;

            for (const project of projects) {
                if (!project.tasks || project.tasks.length === 0) continue;

                const originalCount = project.tasks.length;
                const activeTasks = project.tasks.filter(t => t.status !== 'DONE');

                if (activeTasks.length < originalCount) {
                    const projectRef = doc(db, 'projects', project.id);
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

    addTaskToProject: async (companyId: string, taskTitle: string, columnName: string = 'TODO', targetProjectName?: string) => {
        if (!db) return;

        let project: Project | null = null;
        let projects: Project[] = [];

        const q = query(collection(db, 'projects'), where('companyId', '==', companyId));
        const snap = await getDocs(q);
        projects = snap.docs.map(mapDoc) as Project[];

        if (projects.length === 0) throw new Error("Nenhum projeto encontrado.");

        if (targetProjectName) {
            const lowerTarget = targetProjectName.toLowerCase();
            project = projects.find(p => p.name.toLowerCase().includes(lowerTarget)) || null;
        }

        if (!project) {
            project = projects.find(p => p.name.toLowerCase() === 'geral') || projects[0];
        }

        let statusId = 'TODO';
        const lowerCol = columnName.toLowerCase();

        if (lowerCol.includes('doing') || lowerCol.includes('progresso') || lowerCol.includes('fazendo')) {
            statusId = 'DOING';
        } else if (lowerCol.includes('done') || lowerCol.includes('conclu') || lowerCol.includes('feito')) {
            statusId = 'DONE';
        } else {
            statusId = 'TODO';
        }

        if (project.columns && project.columns.length > 0) {
            const customCol = project.columns.find(c =>
                c.id.toLowerCase() === lowerCol ||
                c.title.toLowerCase().includes(lowerCol)
            );
            if (customCol) {
                statusId = customCol.id;
            } else {
                const hasDefault = project.columns.some(c => c.id === statusId);
                if (!hasDefault) {
                    statusId = project.columns[0].id;
                }
            }
        }

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
    }
};
