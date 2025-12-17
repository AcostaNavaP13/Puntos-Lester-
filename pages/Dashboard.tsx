
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { OrderStatus, User, UserRole, Customer } from '../types';

interface DashboardProps {
  user: User;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalPoints: 0,
    pendingOrders: 0,
    approvedOrders: 0
  });
  const [agentRanking, setAgentRanking] = useState<Customer[]>([]);

  useEffect(() => {
    const customers = storageService.getCustomers();
    const orders = storageService.getOrders();
    
    setStats({
      totalCustomers: customers.length,
      totalPoints: customers.reduce((acc, curr) => acc + curr.points, 0),
      pendingOrders: orders.filter(o => o.status === OrderStatus.PENDIENTE).length,
      approvedOrders: orders.filter(o => o.status === OrderStatus.APROBADO).length,
    });

    if (user.role === UserRole.AGENTE) {
      const sorted = [...customers].sort((a, b) => b.points - a.points);
      setAgentRanking(sorted.slice(0, 5)); // Show top 5 for agent
    }
  }, [user.role]);

  if (user.role === UserRole.AGENTE) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Mi Resumen</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Lester Agentes • Gestión de puntos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl cursor-pointer" onClick={() => setActiveTab('ranking')}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-brand-dark dark:text-white">Ranking Actual</h3>
              <span className="text-brand-green font-bold text-xs uppercase">Ver todo →</span>
            </div>
            <div className="space-y-4">
              {agentRanking.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#333]">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{i + 1}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{c.name}</span>
                  </div>
                  <span className="text-xs font-black text-brand-green">{c.points.toLocaleString()} pts</span>
                </div>
              ))}
              {agentRanking.length === 0 && <p className="text-center text-gray-400 text-xs py-4">No hay datos de clientes.</p>}
            </div>
          </div>

          <div className="bg-brand-green p-8 rounded-[2.5rem] shadow-xl shadow-brand-green/20 text-white flex flex-col justify-between cursor-pointer group" onClick={() => setActiveTab('orders')}>
            <div>
              <h3 className="text-2xl font-black mb-2">Asignar puntos</h3>
              <p className="text-white/80 font-medium mb-6">Carga nuevas confirmaciones de pedido para sumar puntos a tus clientes.</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-4xl">➕</span>
              <span className="bg-white/20 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] group-hover:bg-white group-hover:text-brand-green transition-all">Nueva Carga</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Resumen General</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Bienvenido de nuevo, <span className="text-brand-green font-bold">{user.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Clientes', value: stats.totalCustomers, icon: '👥', color: 'bg-brand-green', tab: 'customers' },
          { label: 'Puntos', value: stats.totalPoints.toLocaleString(), icon: '💎', color: 'bg-brand-dark dark:bg-gray-700', tab: 'ranking' },
          { label: 'Pendientes', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-500', tab: 'validation' },
          { label: 'Aprobados', value: stats.approvedOrders, icon: '✅', color: 'bg-green-600', tab: 'validation' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setActiveTab(stat.tab)}
            className="bg-white dark:bg-[#2a2a2a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          >
            <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg shadow-gray-200 dark:shadow-none`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden cursor-pointer" onClick={() => setActiveTab('levels')}>
            <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">🐘</div>
            <div className="relative z-10">
                <h3 className="text-xl font-black text-brand-dark dark:text-white mb-4">Configuración del Programa</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Gestione los umbrales de puntos y las reglas de asignación global.
                </p>
            </div>
        </div>
        
        <div className="bg-brand-green p-8 rounded-[2rem] shadow-xl shadow-brand-green/20 relative overflow-hidden text-white group cursor-pointer" onClick={() => setActiveTab('ranking')}>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-all group-hover:scale-125"></div>
            <h3 className="text-xl font-black mb-4">Líderes Lester</h3>
            <p className="text-white/80 leading-relaxed font-medium">
              Revisa el ranking detallado de clientes y sus niveles alcanzados.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
