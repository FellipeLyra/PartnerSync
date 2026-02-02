import { userService } from './userService';
import { projectService } from './projectService';
import { timeService } from './timeService';
import { chatService } from './chatService';
import { financeService } from './financeService';
import { crmService } from './crmService';
import { AppNotification } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

// FACADE PATTERN: Re-exporting methods to maintain backward compatibility
// while the codebase is migrated to use individual services directly.
export const storageService = {
  // --- COMPANIES (Delegated to userService) ---
  getCompany: userService.getCompany,
  createCompany: userService.createCompany,
  getCompanyByInviteCode: userService.getCompanyByInviteCode,
  getAllCompanies: userService.getAllCompanies,
  deleteCompany: userService.deleteCompany,

  // --- USERS (Delegated to userService) ---
  getUser: userService.getUser,
  getAllUsers: userService.getAllUsers,
  subscribeCompanyUsers: userService.subscribeCompanyUsers,
  saveUser: userService.saveUser,
  updateUser: userService.updateUser,
  deleteUser: userService.deleteUser,
  updateUserPermissions: userService.updateUserPermissions,
  resetDatabase: async () => { console.warn("Reset Database feature moved/deprecated for safety"); }, // Simplified

  // --- PROJECTS (Delegated to projectService) ---
  subscribeProjects: projectService.subscribeProjects,
  createProject: projectService.createProject,
  updateProject: projectService.updateProject,
  deleteProject: projectService.deleteProject,
  getCompanyProjects: projectService.getCompanyProjects,
  cleanupDoneTasks: projectService.cleanupDoneTasks,
  addTaskToProject: projectService.addTaskToProject,

  // --- TIME ENTRIES (Delegated to timeService) ---
  subscribeTimeEntries: timeService.subscribeTimeEntries,
  saveTimeEntry: timeService.saveTimeEntry,
  cleanupMonthlyTimeEntries: timeService.cleanupMonthlyTimeEntries,

  // --- CHAT (Delegated to chatService) ---
  subscribeChat: chatService.subscribeChat,
  saveChatMessage: chatService.saveChatMessage,
  updateChatMessage: chatService.updateChatMessage,
  deleteChatMessage: chatService.deleteChatMessage,

  // --- FINANCE (Delegated to financeService) ---
  subscribeTransactions: financeService.subscribeTransactions,
  saveTransaction: financeService.saveTransaction,
  updateTransaction: financeService.updateTransaction,
  deleteTransaction: financeService.deleteTransaction,
  getFinancialReport: financeService.getFinancialReport,

  // --- CRM Helpers (Delegated to crmService) ---
  getClientByName: crmService.getClientByName,
  addDeal: crmService.addDeal, // Now using the consolidated logic

  // --- NOTIFICATIONS (Kept here or moved? Logic was inline in storageService) ---
  // Moving to notificationService or keeping here? 
  // The original notificationService was browser only. storageService had the DB part.
  // Ideally we merge them. For now, let's keep the DB part here or moved.
  // I'll move it to `notificationService` in a future step, but explicitly here for now to avoid break.

  createNotification: async (notification: AppNotification) => {
    if (!db) return;
    const { id, ...data } = notification;
    await addDoc(collection(db, 'notifications'), deepSanitize(data));
  },

  subscribeNotifications: (userId: string, callback: (notifications: AppNotification[]) => void) => {
    if (!db || !userId) return () => { };
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(mapDoc) as AppNotification[];
      notifications.sort((a, b) => b.createdAt - a.createdAt);
      callback(notifications);
    }, (error) => {
      console.warn("Firestore Listener Error (Notifications):", error.message);
    });
  },

  markNotificationAsRead: async (notificationId: string) => {
    if (!db) return;
    await setDoc(doc(db, 'notifications', notificationId), { read: true }, { merge: true });
  }
};