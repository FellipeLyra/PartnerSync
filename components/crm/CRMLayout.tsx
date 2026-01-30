import React, { useState } from 'react';
import { User, Company } from '../../types';
import { LayoutDashboard, Users, KanbanSquare, Settings } from 'lucide-react';
import CRMDashboard from './CRMDashboard';
import CRMClientList from './CRMClientList';
import PipelineBoard from '@/components/crm/PipelineBoard';

interface CRMLayoutProps {
    currentUser: User;
    companyId: string;
    onUpdateUser?: (user: User) => void;
}

type CRMView = 'DASHBOARD' | 'PIPELINE' | 'CLIENTS';

const CRMLayout: React.FC<CRMLayoutProps> = ({ currentUser, companyId, onUpdateUser }) => {
    const [view, setView] = useState<CRMView>('DASHBOARD');

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
            {/* SUB-HEADER */}
            <header className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center space-x-6 transition-colors">
                <h2 className="font-bold text-lg text-slate-800 dark:text-white mr-4">CRM</h2>

                <nav className="flex space-x-1">
                    <button
                        onClick={() => setView('DASHBOARD')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${view === 'DASHBOARD' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <LayoutDashboard size={16} />
                        <span>Visão Geral</span>
                    </button>
                    <button
                        onClick={() => setView('PIPELINE')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${view === 'PIPELINE' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <KanbanSquare size={16} />
                        <span>Funil de Vendas</span>
                    </button>
                    <button
                        onClick={() => setView('CLIENTS')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${view === 'CLIENTS' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        <Users size={16} />
                        <span>Clientes & Leads</span>
                    </button>
                </nav>
            </header>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative">
                {view === 'DASHBOARD' && <CRMDashboard companyId={companyId} />}
                {view === 'PIPELINE' && <PipelineBoard currentUser={currentUser} companyId={companyId} />}
                {view === 'CLIENTS' && <CRMClientList currentUser={currentUser} companyId={companyId} />}
            </div>
        </div>
    );
};

export default CRMLayout;
