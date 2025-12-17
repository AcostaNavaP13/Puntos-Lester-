
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Customer, ClientLevelName } from '../types';

const RankingPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('Todos');
  const [filterAgent, setFilterAgent] = useState<string>('');

  useEffect(() => {
    const data = storageService.getCustomers();
    // Sort by points descending
    data.sort((a, b) => b.points - a.points);
    setCustomers(data);
  }, []);

  const levels = ['Todos', ...Object.values(ClientLevelName)];
  const agentsList = ['Todos', ...Array.from(new Set(customers.map(c => c.agentName)))].filter(Boolean);

  const filtered = customers.filter(c => {
    const matchLevel = filterLevel === 'Todos' || c.level === filterLevel;
    const matchAgent = !filterAgent || filterAgent === 'Todos' || c.agentName.toLowerCase().includes(filterAgent.toLowerCase());
    return matchLevel && matchAgent;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Ranking Oficial</h2>
           <p className="text-gray-500 dark:text-gray-400 font-medium">Tabla de líderes del programa de lealtad.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">Nivel</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#2a2a2a] dark:text-white shadow-sm outline-none text-xs font-bold focus:ring-2 focus:ring-brand-green/20"
            >
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1 tracking-widest">Agente</label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#2a2a2a] dark:text-white shadow-sm outline-none text-xs font-bold focus:ring-2 focus:ring-brand-green/20"
            >
              {agentsList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2a2a2a] rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-[#252525]">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Posición</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Puntos</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nivel</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Agente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((customer, index) => (
                <tr key={customer.id} className={`${index < 3 ? 'bg-brand-green/5 dark:bg-brand-green/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        index === 0 ? 'bg-yellow-400 text-white shadow-lg' :
                        index === 1 ? 'bg-slate-300 text-white shadow-lg' :
                        index === 2 ? 'bg-amber-600 text-white shadow-lg' :
                        'text-gray-500 dark:text-gray-400'
                    }`}>
                        {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-black text-gray-900 dark:text-white">{customer.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{customer.location}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className="text-sm font-black text-brand-green">{customer.points.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                      customer.level === 'Platino' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50' :
                      customer.level === 'Oro' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50' :
                      customer.level === 'Plata' ? 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-900/50' :
                      customer.level === 'Bronce' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50' :
                      'bg-brand-green/10 text-brand-green border-brand-green/20'
                    }`}>
                      {customer.level}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {customer.agentName}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest">
                    No se encontraron clientes con esos filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
