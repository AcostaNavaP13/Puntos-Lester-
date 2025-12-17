
import React, { useState } from 'react';
import { ADMIN_ACCESS_CODE } from '../constants';
import { storageService } from '../services/storageService';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type LoginMode = 'select' | 'admin' | 'agente';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<LoginMode>('select');
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue === ADMIN_ACCESS_CODE) {
      onLogin({
        id: 'admin-id',
        name: 'Administrador LESTER',
        role: UserRole.ADMIN,
        username: 'admin'
      });
    } else {
      setError('Código de administrador incorrecto.');
    }
  };

  const handleAgentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const agents = storageService.getAgents();
    const agent = agents.find(a => 
      a.agentNumber === inputValue.trim() && 
      a.lastName.toLowerCase() === passwordValue.trim().toLowerCase()
    );

    if (agent) {
      onLogin({
        id: agent.id,
        name: `${agent.firstName} ${agent.lastName}`,
        role: UserRole.AGENTE,
        username: agent.agentNumber
      });
    } else {
      setError('Número de agente o contraseña incorrectos.');
    }
  };

  const reset = () => {
    setMode('select');
    setInputValue('');
    setPasswordValue('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a] px-4 transition-colors duration-500">
      <div className="max-w-md w-full bg-white dark:bg-[#2a2a2a] rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-800 transition-all">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-green rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-green/30">
             <span className="text-4xl">🐘</span>
          </div>
          <h1 className="text-5xl font-black text-brand-green tracking-tighter text-center w-full">Lester</h1>
          <p className="text-gray-400 dark:text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Colchones • Fidelización</p>
        </div>

        {mode === 'select' && (
          <div className="space-y-4">
            <h2 className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-widest">Panel de Acceso</h2>
            <button
              onClick={() => setMode('agente')}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-[#333333] border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-brand-green dark:hover:border-brand-green hover:bg-brand-green/5 dark:hover:bg-brand-green/10 transition-all group"
            >
              <div className="flex items-center">
                <span className="text-3xl mr-4 group-hover:scale-110 transition-transform">📦</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">Soy Agente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cargar pedidos y ranking</p>
                </div>
              </div>
              <span className="text-brand-green font-black">→</span>
            </button>

            <button
              onClick={() => setMode('admin')}
              className="w-full flex items-center justify-between p-5 bg-white dark:bg-[#333333] border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-brand-green dark:hover:border-brand-green hover:bg-brand-green/5 dark:hover:bg-brand-green/10 transition-all group"
            >
              <div className="flex items-center">
                <span className="text-3xl mr-4 group-hover:scale-110 transition-transform">🔐</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">Soy Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Configuración del sistema</p>
                </div>
              </div>
              <span className="text-brand-green font-black">→</span>
            </button>
          </div>
        )}

        {(mode === 'admin' || mode === 'agente') && (
          <form onSubmit={mode === 'admin' ? handleAdminLogin : handleAgentLogin} className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center mb-4">
              <button 
                type="button" 
                onClick={reset}
                className="text-gray-400 hover:text-brand-green dark:hover:text-brand-green text-xs font-black uppercase tracking-widest flex items-center"
              >
                ← Volver al inicio
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-widest">
                  {mode === 'admin' ? 'Código Administrativo' : 'Número de Agente'}
                </label>
                <input
                  type={mode === 'admin' ? "password" : "text"}
                  value={inputValue}
                  autoFocus
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={mode === 'admin' ? "••••••••" : "Ej. 4025"}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] text-gray-900 dark:text-white focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all font-bold"
                  required
                />
              </div>

              {mode === 'agente' && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-widest">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] text-gray-900 dark:text-white focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all font-bold"
                    required
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-brand-green/30 dark:shadow-none transform active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              Iniciar Sesión
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-800 text-center">
          <p className="text-[10px] text-gray-300 dark:text-gray-700 uppercase tracking-tighter font-black">LESTER V2.5.2 • ECO-FRIENDLY SYSTEM</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
