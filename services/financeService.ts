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
import { Transaction } from '../types';
import { deepSanitize, mapDoc } from './core/firebaseUtils';

export const financeService = {
    subscribeTransactions: (companyId: string, callback: (transactions: Transaction[]) => void) => {
        if (!db || !companyId) return () => { };
        const q = query(
            collection(db, 'transactions'),
            where('companyId', '==', companyId)
        );

        return onSnapshot(q, (snapshot) => {
            const transactions = snapshot.docs.map(mapDoc) as Transaction[];
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

    getFinancialReport: async (companyId: string): Promise<string> => {
        if (!db) return "Erro DB";

        const now = new Date();
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
    }
};
