
import React, { useState, useEffect } from 'react';
import { UserRole, User, OrderStatus } from '../types';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark';
  });
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkPending = () => {
      const orders = storageService.getOrders();
      setPendingCount(orders.filter(o => o.status === OrderStatus.PENDIENTE).length);
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user.role === UserRole.ADMIN;

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'agents', label: 'Agentes', icon: '👷' },
        { id: 'customers', label: 'Clientes', icon: '👥' },
        { id: 'levels', label: 'Niveles', icon: '🏆' },
        { id: 'rewards', label: 'Premios', icon: '🎁' },
        { id: 'ranking', label: 'Ranking', icon: '🔝' },
        { id: 'validation', label: 'Validación', icon: '✅', badge: pendingCount },
      ]
    : [
        { id: 'dashboard', label: 'Resumen', icon: '📊' },
        { id: 'orders', label: 'Asignar puntos', icon: '➕' },
        { id: 'ranking', label: 'Ranking', icon: '🔝' },
      ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-[#1a1a1a] w-full transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-brand-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 transition-colors">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-brand-green tracking-tight">LESTER</h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-300 mt-1 uppercase font-bold">Loyalty Program</p>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-brand-green transition-colors"
            title="Cambiar Modo"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </div>
        
        <nav className="mt-4 px-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 shadow-sm animate-pulse ${
                    activeTab === item.id ? 'bg-white text-brand-green border-white' : 'bg-red-600 text-white border-white dark:border-brand-dark'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-brand-dark">
          <div className="flex items-center p-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold mr-3 border border-brand-green/20">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 border border-red-200 dark:border-red-900/50 text-xs font-bold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-50 dark:bg-[#1a1a1a] transition-colors">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
