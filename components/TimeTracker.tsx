import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, AlertCircle, CheckCircle, History, Calendar, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { TimeEntry, User } from '../types';
import { storageService } from '../services/storageService';

interface TimeTrackerProps {
  currentUser: User;
  companyId: string;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ currentUser, companyId }) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Real-time subscription
    if (!companyId) return;
    const unsubscribe = storageService.subscribeTimeEntries(companyId, (data) => {
      setEntries(data);
    });
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [companyId]);

  const handleClockAction = async (type: 'IN' | 'OUT') => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Logic: Late if after 8:00 AM (e.g., 8:01 is late)
    const isLate = type === 'IN' && (currentHour > 8 || (currentHour === 8 && currentMinute > 0));

    const newEntry: TimeEntry = {
      id: '', // Auto-generated
      userId: currentUser.id,
      companyId: companyId,
      username: currentUser.username,
      timestamp: now.toISOString(),
      type,
      isLate,
    };

    await storageService.saveTimeEntry(newEntry);
  };

  // --- Statistics Calculation (Memoized) ---
  const todayEntry = useMemo(() => entries.find(
    (e) =>
      new Date(e.timestamp).toDateString() === new Date().toDateString() &&
      e.userId === currentUser.id &&
      e.type === 'IN'
  ), [entries, currentUser.id]);

  const calculateDelayMinutes = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const target = new Date(date);
    target.setHours(8, 0, 0, 0);
    const diffMs = date.getTime() - target.getTime();
    return Math.floor(diffMs / 60000);
  }, []);

  const { totalLateDays, averageDelay } = useMemo(() => {
    const myInEntries = entries.filter(e => e.userId === currentUser.id && e.type === 'IN');
    const lateEntries = myInEntries.filter(e => e.isLate);
    const totalLate = lateEntries.length;

    const totalDelay = lateEntries.reduce((acc, curr) => acc + calculateDelayMinutes(curr.timestamp), 0);
    const avgDelay = totalLate > 0 ? Math.round(totalDelay / totalLate) : 0;

    return { totalLateDays: totalLate, averageDelay: avgDelay };
  }, [entries, currentUser.id, calculateDelayMinutes]);

  // --- Week Helper (Memoized) ---
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon...
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const getStatusForDay = useCallback((date: Date) => {
    const entry = entries.find(e =>
      new Date(e.timestamp).toDateString() === date.toDateString() &&
      e.userId === currentUser.id &&
      e.type === 'IN'
    );

    const isToday = date.toDateString() === new Date().toDateString();
    const isPast = date < new Date() && !isToday;

    if (entry) {
      return entry.isLate ? 'LATE' : 'OK';
    }
    if (isPast) return 'MISSING';
    if (isToday) return 'PENDING';
    return 'FUTURE';
  }, [entries, currentUser.id]);

  // Identify Partners (Memoized)
  const partnerEntries = useMemo(() => {
    const otherUserIds = Array.from(new Set(entries.filter(e => e.userId !== currentUser.id).map(e => e.userId)));
    return otherUserIds.map(uid => {
      const lastEntry = entries.find(e => e.userId === uid && new Date(e.timestamp).toDateString() === new Date().toDateString());
      return { uid, lastEntry, username: entries.find(e => e.userId === uid)?.username || 'Parceiro' };
    });
  }, [entries, currentUser.id]);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Bater Ponto</h2>
          <p className="text-slate-600 dark:text-slate-400 transition-colors">Gerencie seus horários. A meta é começar às 08:00 em ponto.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center shadow-lg transition-colors">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase transition-colors">Seus Atrasos</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{totalLateDays} <span className="text-sm text-slate-500 dark:text-slate-500 font-normal">dias</span></p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center shadow-lg transition-colors">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase transition-colors">Sua Média de Atraso</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{averageDelay} <span className="text-sm text-slate-500 dark:text-slate-500 font-normal">minutos</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Clock Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="text-6xl font-mono font-bold text-slate-900 dark:text-white mb-4 tracking-wider transition-colors">
              {currentTime.toLocaleTimeString('pt-BR')}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-lg mb-8 uppercase tracking-widest font-medium transition-colors">
              {currentTime.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}  </div>

            {!todayEntry ? (
              <button
                onClick={() => handleClockAction('IN')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-emerald-600 rounded-full hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 focus:ring-offset-white dark:focus:ring-offset-slate-800 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/50"
              >
                <Clock className="mr-2 -ml-1 h-6 w-6 group-hover:animate-pulse" />
                REGISTRAR ENTRADA
              </button>
            ) : (
              <div className="flex flex-col items-center animate-fade-in w-full">
                <div className={`flex items-center space-x-2 text-lg font-bold mb-6 p-4 rounded-xl w-full justify-center ${todayEntry.isLate ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {todayEntry.isLate ? <AlertCircle /> : <CheckCircle />}
                  <span>{todayEntry.isLate ? 'Entrada com Atraso' : 'Entrada Pontual'}</span>
                </div>
                <button
                  onClick={() => handleClockAction('OUT')}
                  className="w-full px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors border border-slate-300 dark:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                >
                  Registrar Saída (Fim do Dia)
                </button>
              </div>
            )}
          </div>

          {/* Weekly Status */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center transition-colors">
              <Calendar className="mr-2 text-indigo-400" size={20} />
              Sua Meta Semanal (Seg-Sex)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {weekDays.map((day, idx) => {
                const status = getStatusForDay(day);
                const dayName = day.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);

                let bgClass = 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600';
                let textClass = 'text-slate-400 dark:text-slate-400';
                let icon = null;

                if (status === 'OK') {
                  bgClass = 'bg-emerald-500/20 border-emerald-500/50';
                  textClass = 'text-emerald-400';
                  icon = <CheckCircle size={16} />;
                } else if (status === 'LATE') {
                  bgClass = 'bg-red-500/20 border-red-500/50';
                  textClass = 'text-red-400';
                  icon = <AlertCircle size={16} />;
                } else if (status === 'MISSING') {
                  bgClass = 'bg-red-900/20 border-red-900/30';
                  textClass = 'text-red-700';
                  icon = <span className="text-xs font-bold">X</span>;
                }

                return (
                  <div key={idx} className={`rounded-xl border ${bgClass} p-3 flex flex-col items-center justify-center transition-all`}>
                    <span className={`text-xs uppercase font-bold mb-1 ${textClass}`}>{dayName}</span>
                    <div className={textClass}>
                      {icon || <div className="w-4 h-4 rounded-full border-2 border-current opacity-20" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Status (New Section) */}
          {partnerEntries.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center transition-colors">
                <Users className="mr-2 text-blue-400" size={20} />
                Status da Equipe (Hoje)
              </h3>
              <div className="space-y-3">
                {partnerEntries.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white transition-colors">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors">{p.username}</span>
                    </div>
                    <div>
                      {p.lastEntry ? (
                        <div className="flex items-center space-x-2">
                          {p.lastEntry.isLate ? (
                            <span className="text-xs text-red-400 flex items-center font-bold">
                              <AlertCircle size={12} className="mr-1" /> Chegou às {new Date(p.lastEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400 flex items-center font-bold">
                              <CheckCircle size={12} className="mr-1" /> Pontual ({new Date(p.lastEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-500 italic">Ainda não chegou</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between transition-colors">
            <span className="flex items-center"><History className="mr-2 text-indigo-400" /> Histórico Completo</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-500">Últimos registros</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {entries.length === 0 && (
              <p className="text-slate-500 dark:text-slate-500 text-center py-8 transition-colors">Nenhum registro encontrado.</p>
            )}
            {entries.map((entry) => {
              const date = new Date(entry.timestamp);
              const delay = entry.isLate && entry.type === 'IN' ? calculateDelayMinutes(entry.timestamp) : 0;
              const isMe = entry.userId === currentUser.id;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isMe ? 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/30 opacity-75 hover:opacity-100'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-10 rounded-full ${entry.type === 'IN'
                        ? entry.isLate
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                        : 'bg-slate-500'
                        }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-200 flex items-center transition-colors">
                        {entry.username}
                        {isMe && <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono">VOCÊ</span>}
                        {entry.type === 'IN' && entry.isLate && (
                          <span className="ml-2 text-[10px] bg-red-500/20 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded font-mono">
                            +{delay}m
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                        {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
                      {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className={`text-xs font-bold uppercase ${entry.type === 'IN'
                      ? entry.isLate
                        ? 'text-red-400'
                        : 'text-emerald-400'
                      : 'text-slate-500'
                      }`}>
                      {entry.type === 'IN' ? (entry.isLate ? 'ATRASADO' : 'PONTUAL') : 'SAÍDA'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;