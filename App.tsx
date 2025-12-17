
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { STORAGE_KEYS } from './constants';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AgentsPage from './pages/AgentsPage';
import CustomersPage from './pages/CustomersPage';
import LevelsPage from './pages/LevelsPage';
import RewardsPage from './pages/RewardsPage';
import RankingPage from './pages/RankingPage';
import OrdersAgentPage from './pages/OrdersAgentPage';
import ValidationAdminPage from './pages/ValidationAdminPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedAuth) {
      setUser(JSON.parse(savedAuth));
    }
    setIsInitialized(true);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(u));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  if (!isInitialized) return null;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} setActiveTab={setActiveTab} />;
      case 'agents': return user.role === UserRole.ADMIN ? <AgentsPage /> : null;
      case 'customers': return user.role === UserRole.ADMIN ? <CustomersPage /> : null;
      case 'levels': return user.role === UserRole.ADMIN ? <LevelsPage /> : null;
      case 'rewards': return user.role === UserRole.ADMIN ? <RewardsPage /> : null;
      case 'ranking': return <RankingPage />;
      case 'orders': return user.role === UserRole.AGENTE ? <OrdersAgentPage user={user} /> : null;
      case 'validation': return user.role === UserRole.ADMIN ? <ValidationAdminPage /> : null;
      default: return <Dashboard user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
