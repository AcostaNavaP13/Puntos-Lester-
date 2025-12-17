
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Reward } from '../types';

const RewardsPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [formData, setFormData] = useState({
    pointsRequired: 0,
    description: '',
    isActive: true
  });

  useEffect(() => {
    setRewards(storageService.getRewards());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Reward[];
    if (editingReward) {
      updated = rewards.map(r => r.id === editingReward.id ? { ...r, ...formData } : r);
    } else {
      updated = [...rewards, { id: Date.now().toString(), ...formData }];
    }
    setRewards(updated);
    storageService.saveRewards(updated);
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este premio?')) {
      const updated = rewards.filter(r => r.id !== id);
      setRewards(updated);
      storageService.saveRewards(updated);
    }
  };

  const openModal = (reward: Reward | null = null) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({ 
        pointsRequired: reward.pointsRequired, 
        description: reward.description, 
        isActive: reward.isActive 
      });
    } else {
      setEditingReward(null);
      setFormData({ pointsRequired: 0, description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Catálogo de Premios</h2>
           <p className="text-gray-500 dark:text-gray-400 font-medium">Gestiona las recompensas disponibles.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-green hover:bg-brand-green-hover text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-green/20"
        >
          + Nuevo Premio
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between hover:shadow-xl transition-all group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-brand-green/10 text-brand-green uppercase tracking-widest border border-brand-green/20">
                  {reward.pointsRequired.toLocaleString()} Puntos
                </span>
                <span className={`h-3 w-3 rounded-full shadow-sm ${reward.isActive ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-300 dark:bg-gray-700'}`} title={reward.isActive ? 'Activo' : 'Inactivo'}></span>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{reward.description}</h3>
            </div>
            <div className="mt-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openModal(reward)} className="text-[10px] font-black uppercase tracking-widest text-brand-green hover:underline">Editar</button>
              <button onClick={() => handleDelete(reward.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
        {rewards.length === 0 && (
          <div className="col-span-full py-24 text-center text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem]">
            No hay premios configurados 🐘
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/80 dark:bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-black dark:text-white mb-8">{editingReward ? 'Editar Premio' : 'Crear Premio'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-widest">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-2xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none resize-none font-medium"
                  placeholder="Ej. Colchón Lester Modelo Premium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 tracking-widest">Puntos Requeridos</label>
                <input
                  type="number"
                  required
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({...formData, pointsRequired: parseInt(e.target.value) || 0})}
                  className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-2xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold"
                />
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-[#333] rounded-2xl border border-gray-100 dark:border-gray-800">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-5 w-5 text-brand-green focus:ring-brand-green border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
                <label htmlFor="isActive" className="ml-3 block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Premio disponible para canje
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={closeModal} className="px-6 py-2 text-gray-400 hover:text-gray-600 font-black uppercase tracking-widest text-[10px]">Cerrar</button>
                <button type="submit" className="px-10 py-4 bg-brand-green text-white hover:bg-brand-green-hover rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-green/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
