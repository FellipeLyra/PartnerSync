import React, { useEffect, useState } from 'react';
import { crmService } from '../../services/crmService';
import { Deal, Client } from '../../types';
import { DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface CRMDashboardProps {
    companyId: string;
}

const CRMDashboard: React.FC<CRMDashboardProps> = ({ companyId }) => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState({
        totalPipelineValue: 0,
        wonDealsValue: 0,
        openDealsCount: 0,
        conversionRate: 0
    });

    useEffect(() => {
        const unsubDeals = crmService.subscribeDeals(companyId, (data) => setDeals(data));
        const unsubClients = crmService.subscribeClients(companyId, (data) => setClients(data));
        return () => { unsubDeals(); unsubClients(); };
    }, [companyId]);

    useEffect(() => {
        const totalValue = deals.filter(d => d.status === 'OPEN').reduce((acc, curr) => acc + (curr.value || 0), 0);
        const wonValue = deals.filter(d => d.status === 'WON').reduce((acc, curr) => acc + (curr.value || 0), 0);
        const openCount = deals.filter(d => d.status === 'OPEN').length;

        const totalClosed = deals.filter(d => d.status === 'WON' || d.status === 'LOST').length;
        const wonCount = deals.filter(d => d.status === 'WON').length;
        const conversion = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0;

        setStats({
            totalPipelineValue: totalValue,
            wonDealsValue: wonValue,
            openDealsCount: openCount,
            conversionRate: conversion
        });
    }, [deals]);

    return (
        <div className="p-6 overflow-y-auto h-full custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard de Vendas</h2>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/20 rounded-lg">
                            <DollarSign className="text-indigo-400" size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Forecast (Aberto)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">R$ {stats.totalPipelineValue.toLocaleString('pt-BR')}</h3>
                    <p className="text-sm text-slate-400 mt-1">{stats.openDealsCount} negócios em andamento</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Vendas Realizadas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">R$ {stats.wonDealsValue.toLocaleString('pt-BR')}</h3>
                    <p className="text-sm text-slate-400 mt-1">Total acumulado</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Users className="text-blue-400" size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Total de Clientes</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">{clients.length}</h3>
                    <p className="text-sm text-slate-400 mt-1">Cadastrados na base</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <AlertCircle className="text-purple-400" size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">Taxa de Conversão</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</h3>
                    <p className="text-sm text-slate-400 mt-1">Ganho vs. Perdido</p>
                </div>
            </div>

            {/* VISUAL CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4">Funil de Vendas (Quantidade por Etapa)</h3>
                    <div className="space-y-4">
                        {['PROSPECT', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'].map(stageId => {
                            const STAGE_LABELS: Record<string, string> = {
                                'PROSPECT': 'Prospecção',
                                'QUALIFICATION': 'Qualificação',
                                'PROPOSAL': 'Proposta',
                                'NEGOTIATION': 'Negociação'
                            };

                            const count = deals.filter(d => d.stageId === stageId).length;
                            // Calculate max for scale (avoid division by zero if total is 0)
                            const max = Math.max(...['PROSPECT', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'].map(s => deals.filter(d => d.stageId === s).length), 1);
                            const percentage = (count / max) * 100;

                            return (
                                <div key={stageId}>
                                    <div className="flex justify-between text-sm text-slate-300 mb-1">
                                        <span>{STAGE_LABELS[stageId]}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="font-bold text-white mb-4">Últimos Negócios Ganhos</h3>
                    <div className="space-y-3">
                        {deals.filter(d => d.status === 'WON').slice(0, 5).map(deal => (
                            <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                                <div>
                                    <p className="font-bold text-white text-sm">{deal.title}</p>
                                    <p className="text-xs text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="text-emerald-400 font-bold text-sm">R$ {deal.value.toLocaleString()}</span>
                            </div>
                        ))}
                        {deals.filter(d => d.status === 'WON').length === 0 && (
                            <p className="text-slate-500 text-sm italic">Nenhum negócio fechado recentemente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMDashboard;
