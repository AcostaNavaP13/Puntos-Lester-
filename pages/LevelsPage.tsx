
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { LevelThreshold, AppConfig } from '../types';

const LevelsPage: React.FC = () => {
  const [levels, setLevels] = useState<LevelThreshold[]>([]);
  const [config, setConfig] = useState<AppConfig>({ pointRatio: 100 });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setLevels(storageService.getLevels());
    setConfig(storageService.getConfig());
  }, []);

  const handleLevelChange = (index: number, val: string) => {
    const num = parseInt(val) || 0;
    const updated = [...levels];
    updated[index].minPoints = num;
    setLevels(updated);
  };

  const handleSave = () => {
    storageService.saveLevels(levels);
    storageService.saveConfig(config);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleRecalculate = () => {
    const customers = storageService.getCustomers();
    const updated = customers.map(c => ({
      ...c,
      level: storageService.calculateLevel(c.points, levels)
    }));
    storageService.saveCustomers(updated);
    alert('Niveles recalculados para todos los clientes exitosamente.');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
      <div>
        <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Reglas del Sistema</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Define umbrales de nivel y ratios de conversión de puntos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-xl font-black dark:text-white mb-6 flex items-center">
            <span className="mr-3 p-2 bg-brand-green/10 text-brand-green rounded-xl">🏆</span> Umbrales por Nivel
          </h3>
          <div className="space-y-4">
            {levels.map((lvl, idx) => (
              <div key={lvl.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#333] rounded-2xl border border-gray-100 dark:border-gray-700">
                <span className="font-black text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest">{lvl.name}</span>
                <div className="flex items-center">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter mr-2">Mínimo:</span>
                  <input
                    type="number"
                    value={lvl.minPoints}
                    onChange={(e) => handleLevelChange(idx, e.target.value)}
                    className="w-24 px-3 py-2 bg-white dark:bg-[#1a1a1a] dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none text-right font-black"
                  />
                  <span className="ml-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-[#2a2a2a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h3 className="text-xl font-black dark:text-white mb-6 flex items-center">
              <span className="mr-3 p-2 bg-brand-green/10 text-brand-green rounded-xl">⚙️</span> Conversión de Puntos
            </h3>
            <div className="p-6 bg-brand-green/5 dark:bg-brand-green/10 rounded-[2rem] border border-brand-green/10 dark:border-brand-green/20">
              <label className="block text-[10px] font-black text-brand-green uppercase tracking-widest mb-4">Ratio de Acumulación</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">1 Punto por cada</span>
                <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">$</span>
                    <input
                      type="number"
                      value={config.pointRatio}
                      onChange={(e) => setConfig({ pointRatio: parseInt(e.target.value) || 1 })}
                      className="w-full sm:w-32 pl-8 pr-4 py-3 bg-white dark:bg-[#1a1a1a] dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-green outline-none text-right font-black"
                    />
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">pagados</span>
              </div>
              <p className="mt-4 text-[10px] text-brand-green font-black uppercase tracking-widest italic opacity-70">Fórmula Actual: Monto / {config.pointRatio}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleSave}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-green/20 ${
                isSuccess ? 'bg-green-500 text-white' : 'bg-brand-green hover:bg-brand-green-hover text-white'
              }`}
            >
              {isSuccess ? '¡Guardado Correctamente!' : 'Aplicar Cambios'}
            </button>
            <button
              onClick={handleRecalculate}
              className="w-full py-4 bg-brand-dark dark:bg-gray-800 hover:opacity-90 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all"
            >
              Recalcular Clientes (Sync Global)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;
