
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
      setAgentRanking(sorted.slice(0, 5)); 
    }
  }, [user.role]);

  if (user.role === UserRole.AGENTE) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-brand-green/10 rounded-3xl text-3xl">🐘</div>
           <div>
              <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Mi Resumen</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Hola, {user.name}. Aquí el estado de tu ranking.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl cursor-pointer group" 
            onClick={() => setActiveTab('ranking')}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-brand-dark dark:text-white">Top 5 Clientes</h3>
              <span className="text-brand-green font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">Ver Ranking Completo →</span>
            </div>
            <div className="space-y-4">
              {agentRanking.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#333] border border-transparent hover:border-brand-green/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{i + 1}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{c.name}</span>
                  </div>
                  <span className="text-xs font-black text-brand-green">{c.points.toLocaleString()} pts</span>
                </div>
              ))}
              {agentRanking.length === 0 && <p className="text-center text-gray-400 text-xs py-8">No hay clientes asignados.</p>}
            </div>
          </div>

          <div 
            className="bg-brand-green p-10 rounded-[3rem] shadow-xl shadow-brand-green/20 text-white flex flex-col justify-between cursor-pointer group relative overflow-hidden" 
            onClick={() => setActiveTab('orders')}
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">➕</div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4">Asignar puntos</h3>
              <p className="text-white/80 font-medium mb-10 max-w-xs text-lg">Inicia una nueva solicitud cargando los PDFs de confirmación y pedido.</p>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="bg-white text-brand-green px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs group-hover:scale-105 transition-transform">Nueva Solicitud</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Panel Administrativo</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Control global de puntos y clientes LESTER.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Clientes', value: stats.totalCustomers, icon: '👥', color: 'bg-brand-green', tab: 'customers' },
          { label: 'Puntos Totales', value: stats.totalPoints.toLocaleString(), icon: '💎', color: 'bg-brand-dark dark:bg-gray-700', tab: 'ranking' },
          { label: 'Pendientes', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-500', tab: 'validation' },
          { label: 'Aprobados', value: stats.approvedOrders, icon: '✅', color: 'bg-green-600', tab: 'validation' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setActiveTab(stat.tab)}
            className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
          >
            <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div 
            className="bg-white dark:bg-[#2a2a2a] p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden cursor-pointer hover:border-brand-green transition-colors" 
            onClick={() => setActiveTab('levels')}
        >
            <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl">⚙️</div>
            <h3 className="text-2xl font-black text-brand-dark dark:text-white mb-4">Configuración de Niveles</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Ajusta los umbrales de puntos para Platino, Oro y Plata. Los cambios se aplican globalmente.
            </p>
        </div>
        
        <div 
            className="bg-brand-dark dark:bg-[#333] p-10 rounded-[3rem] shadow-xl relative overflow-hidden text-white group cursor-pointer" 
            onClick={() => setActiveTab('ranking')}
        >
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl transition-all group-hover:scale-125"></div>
            <h3 className="text-2xl font-black mb-4">Métricas de Fidelización</h3>
            <p className="text-white/60 leading-relaxed font-medium">
              Analiza el comportamiento de compra de los clientes y su progreso en el programa de lealtad.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
