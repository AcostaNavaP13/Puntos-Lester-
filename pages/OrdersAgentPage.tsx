
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Customer, OrderStatus, Order, User } from '../types';

interface OrdersAgentPageProps {
  user: User;
}

const OrdersAgentPage: React.FC<OrdersAgentPageProps> = ({ user }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    customerId: '',
    folio: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: '',
    paymentPdf: '',
    originalOrderPdf: ''
  });

  useEffect(() => {
    setCustomers(storageService.getCustomers());
  }, []);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'paymentPdf' | 'originalOrderPdf') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Formato no válido. Debe ser PDF.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.paymentPdf || !formData.originalOrderPdf) {
      alert('Se requieren ambos documentos (Confirmación y Pedido) en formato PDF.');
      return;
    }

    setIsSubmitting(true);
    const customer = customers.find(c => c.id === formData.customerId);
    
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      customerId: formData.customerId,
      customerName: customer?.name || 'Cliente desconocido',
      folio: formData.folio,
      date: formData.date,
      amount: parseFloat(formData.amount),
      paymentPdf: formData.paymentPdf,
      originalOrderPdf: formData.originalOrderPdf,
      notes: formData.notes,
      status: OrderStatus.PENDIENTE,
      agentId: user.id
    };

    const currentOrders = storageService.getOrders();
    storageService.saveOrders([...currentOrders, newOrder]);

    setSuccessMsg('Solicitud enviada correctamente para validación.');
    setFormData({
      customerId: '', folio: '', date: new Date().toISOString().split('T')[0],
      amount: '', notes: '', paymentPdf: '', originalOrderPdf: ''
    });
    
    setTimeout(() => {
      setSuccessMsg('');
      setIsSubmitting(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-brand-dark dark:text-white tracking-tighter">Asignar puntos</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Gestión de créditos por ventas confirmadas.</p>
        </div>
        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center text-3xl">📄</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#2a2a2a] rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 p-12 space-y-10 transition-colors">
        {successMsg && (
          <div className="p-6 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-3xl font-black uppercase tracking-widest text-xs text-center animate-bounce">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Cliente Responsable</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              className="w-full px-6 py-5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-[1.5rem] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold"
            >
              <option value="">Selecciona un cliente de tu lista...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.location})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Folio / Factura</label>
            <input
              type="text"
              required
              value={formData.folio}
              onChange={(e) => setFormData({...formData, folio: e.target.value})}
              placeholder="Ej. FAC-2025-01"
              className="w-full px-6 py-5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-[1.5rem] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Monto Total Pagado (MXN)</label>
            <div className="relative">
              <span className="absolute left-6 top-5 text-gray-400 font-black">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                className="w-full pl-12 pr-6 py-5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-[1.5rem] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Confirmación de Pago (PDF)</label>
              <div className={`p-8 border-2 border-dashed rounded-[2rem] text-center transition-all ${formData.paymentPdf ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 dark:border-gray-700 hover:border-brand-green'}`}>
                {formData.paymentPdf ? (
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">✅</span>
                     <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Cargado</span>
                     <button type="button" onClick={() => setFormData({...formData, paymentPdf: ''})} className="text-[9px] font-black uppercase text-red-500 hover:underline">Eliminar archivo</button>
                   </div>
                ) : (
                  <label className="cursor-pointer group">
                    <span className="text-3xl block mb-2 opacity-50 group-hover:opacity-100 transition-opacity">📄</span>
                    <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Seleccionar PDF</span>
                    <input type="file" accept=".pdf" className="sr-only" onChange={(e) => handlePdfUpload(e, 'paymentPdf')} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pedido Original (PDF)</label>
              <div className={`p-8 border-2 border-dashed rounded-[2rem] text-center transition-all ${formData.originalOrderPdf ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 dark:border-gray-700 hover:border-brand-green'}`}>
                {formData.originalOrderPdf ? (
                   <div className="flex flex-col items-center gap-3">
                     <span className="text-3xl">✅</span>
                     <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Cargado</span>
                     <button type="button" onClick={() => setFormData({...formData, originalOrderPdf: ''})} className="text-[9px] font-black uppercase text-red-500 hover:underline">Eliminar archivo</button>
                   </div>
                ) : (
                  <label className="cursor-pointer group">
                    <span className="text-3xl block mb-2 opacity-50 group-hover:opacity-100 transition-opacity">📋</span>
                    <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Seleccionar PDF</span>
                    <input type="file" accept=".pdf" className="sr-only" onChange={(e) => handlePdfUpload(e, 'originalOrderPdf')} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Notas para el Administrador</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-6 py-5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-[1.5rem] focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none resize-none font-medium"
              placeholder="Escribe aquí si hay algún detalle especial con este pago..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 bg-brand-green hover:bg-brand-green-hover text-white text-sm font-black rounded-3xl shadow-xl shadow-brand-green/30 transform active:scale-[0.98] transition-all disabled:bg-gray-400 uppercase tracking-widest"
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar y Solicitar Puntos'}
        </button>
      </form>
    </div>
  );
};

export default OrdersAgentPage;
