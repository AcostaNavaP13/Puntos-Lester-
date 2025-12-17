
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Agent } from '../types';

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    agentNumber: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    setAgents(storageService.getAgents());
  }, []);

  const downloadTemplate = () => {
    const headers = 'Numero_Agente,Nombre,Apellido\n';
    const example = '1001,Juan,Perez\n1002,Maria,Gomez';
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_agentes_lester.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvInput(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Agent[];
    if (editingAgent) {
      updated = agents.map(a => a.id === editingAgent.id ? { ...a, ...formData } : a);
    } else {
      updated = [...agents, { id: Date.now().toString(), ...formData }];
    }
    setAgents(updated);
    storageService.saveAgents(updated);
    closeModal();
  };

  const handleImport = () => {
    try {
      const rows = csvInput.split('\n').filter(row => row.trim() !== '');
      if (rows.length === 0) return;

      // Skip header if it exists
      const startIndex = rows[0].toLowerCase().includes('numero') ? 1 : 0;
      
      const newAgents: Agent[] = rows.slice(startIndex).map(row => {
        const parts = row.split(/[,\t;]/).map(s => s.trim());
        if (parts.length < 3) return null;
        const [num, fname, lname] = parts;
        return {
          id: `imp-${Math.random().toString(36).substr(2, 9)}`,
          agentNumber: num,
          firstName: fname,
          lastName: lname
        };
      }).filter(a => a !== null) as Agent[];

      if (newAgents.length === 0) {
        throw new Error('No se detectaron datos válidos');
      }

      const updated = [...agents, ...newAgents];
      setAgents(updated);
      storageService.saveAgents(updated);
      setIsImportOpen(false);
      setCsvInput('');
      alert(`Se importaron ${newAgents.length} agentes exitosamente.`);
    } catch (err) {
      alert('Error al importar. Asegúrate de usar el formato de la plantilla: Numero, Nombre, Apellido');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este agente?')) {
      const updated = agents.filter(a => a.id !== id);
      setAgents(updated);
      storageService.saveAgents(updated);
    }
  };

  const openModal = (agent: Agent | null = null) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({ 
        agentNumber: agent.agentNumber, 
        firstName: agent.firstName, 
        lastName: agent.lastName 
      });
    } else {
      setEditingAgent(null);
      setFormData({ agentNumber: '', firstName: '', lastName: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Agentes</h2>
          <p className="text-sm text-gray-500">Control de acceso para el personal de ventas</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadTemplate}
            className="bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center"
          >
            <span className="mr-2">📥</span> Plantilla Excel
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center"
          >
            <span className="mr-2">📊</span> Importar
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            + Nuevo Agente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contraseña</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{agent.agentNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.firstName} {agent.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">********</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(agent)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                  <button onClick={() => handleDelete(agent.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">👤</span>
                    <p>No hay agentes registrados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-6">{editingAgent ? 'Editar Agente' : 'Nuevo Agente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Agente</label>
                <input
                  type="text"
                  required
                  value={formData.agentNumber}
                  onChange={(e) => setFormData({...formData, agentNumber: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. 1001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña (Apellido)</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">Cargar Agentes</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 italic">Opción 1: Seleccionar archivo (.csv o .txt)</label>
              <input 
                type="file" 
                accept=".csv,.txt"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 italic">Opción 2: Pegar datos directamente</label>
              <p className="text-xs text-gray-500 mb-2">Columnas: <strong>Numero_Agente, Nombre, Apellido</strong></p>
              <textarea
                rows={6}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="1001,Juan,Perez&#10;1002,Maria,Lopez"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 italic">Delimitado por comas, punto y coma o tabulación.</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setIsImportOpen(false); setCsvInput(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button 
                  onClick={handleImport} 
                  disabled={!csvInput.trim()}
                  className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Confirmar Carga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
