
import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Customer, ClientLevelName } from '../types';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    clientType: '',
    agentName: '',
    accountType: ''
  });

  useEffect(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  const downloadTemplate = () => {
    const headers = 'Nombre,Ubicacion,Tipo_Cliente,Agente_Responsable,Tipo_Cuenta\n';
    const example = 'Empresa ABC,Ciudad de Mexico,Mayorista,Juan Perez,VIP\nTienda Local,Monterrey,Minorista,Maria Lopez,Regular';
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_clientes_lester.csv');
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
    let updated: Customer[];
    
    if (editingCustomer) {
      updated = customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c);
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        points: 0,
        level: ClientLevelName.NUEVO
      };
      updated = [...customers, newCustomer];
    }

    setCustomers(updated);
    storageService.saveCustomers(updated);
    closeModal();
  };

  const handleImport = () => {
    try {
      const rows = csvInput.split('\n').filter(row => row.trim() !== '');
      if (rows.length === 0) return;

      const startIndex = rows[0].toLowerCase().includes('nombre') ? 1 : 0;
      
      const newCustomers: Customer[] = rows.slice(startIndex).map(row => {
        const parts = row.split(/[,\t;]/).map(s => s.trim());
        if (parts.length < 5) return null;
        const [name, loc, type, agent, accType] = parts;
        return {
          id: `cust-${Math.random().toString(36).substr(2, 9)}`,
          name,
          location: loc,
          clientType: type,
          agentName: agent,
          accountType: accType,
          points: 0,
          level: ClientLevelName.NUEVO
        };
      }).filter(c => c !== null) as Customer[];

      if (newCustomers.length === 0) throw new Error();

      const updated = [...customers, ...newCustomers];
      setCustomers(updated);
      storageService.saveCustomers(updated);
      setIsImportOpen(false);
      setCsvInput('');
      alert(`Se importaron ${newCustomers.length} clientes exitosamente.`);
    } catch (err) {
      alert('Error al importar. Usa el formato de la plantilla: Nombre, Ubicacion, Tipo_Cliente, Agente_Responsable, Tipo_Cuenta');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      storageService.saveCustomers(updated);
    }
  };

  const openModal = (customer: Customer | null = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        location: customer.location,
        clientType: customer.clientType,
        agentName: customer.agentName,
        accountType: customer.accountType
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', location: '', clientType: '', agentName: '', accountType: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h2>
          <p className="text-sm text-gray-500">Administra la base de datos de clientes del programa</p>
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
            + Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Agente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Puntos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nivel</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.agentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.points}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.level === 'Platino' ? 'bg-indigo-100 text-indigo-800' :
                    customer.level === 'Oro' ? 'bg-yellow-100 text-yellow-800' :
                    customer.level === 'Plata' ? 'bg-gray-200 text-gray-800' :
                    customer.level === 'Bronce' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {customer.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(customer)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                  <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No hay clientes registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo Cliente</label>
                  <select
                    value={formData.clientType}
                    onChange={(e) => setFormData({...formData, clientType: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Minorista">Minorista</option>
                    <option value="Mayorista">Mayorista</option>
                    <option value="Distribuidor">Distribuidor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo Cuenta</label>
                  <input
                    type="text"
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    placeholder="Ej. VIP, Regular"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Agente Responsable</label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({...formData, agentName: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">Importar Clientes</h3>
            
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
              <p className="text-xs text-gray-500 mb-2">Columnas: <strong>Nombre, Ubicacion, Tipo_Cliente, Agente_Responsable, Tipo_Cuenta</strong></p>
              <textarea
                rows={6}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Empresa A,CDMX,Mayorista,Agente 1,VIP&#10;Tienda B,Mty,Minorista,Agente 2,Regular"
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

export default CustomersPage;
