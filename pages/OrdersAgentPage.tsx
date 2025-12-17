
import React, { useState, useEffect, useRef } from 'react';
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
        alert('Por favor selecciona un archivo PDF válido.');
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
      alert('Debes adjuntar ambos PDFs: Confirmación de pago y Pedido original.');
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

    setSuccessMsg('Solicitud de puntos enviada. Un administrador validará los documentos.');
    setFormData({
      customerId: '',
      folio: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      notes: '',
      paymentPdf: '',
      originalOrderPdf: ''
    });
    
    setTimeout(() => {
      setSuccessMsg('');
      setIsSubmitting(false);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Asignar puntos</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Carga la documentación requerida para sumar puntos a un cliente.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#2a2a2a] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-10 space-y-8 transition-colors">
        {successMsg && (
          <div className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 rounded-2xl font-black uppercase tracking-widest text-[10px] animate-pulse">
            ✅ {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Cliente Seleccionado</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-2xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold"
            >
              <option value="">Buscar en cartera...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.location})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Folio de Factura / Factura</label>
            <input
              type="text"
              required
              value={formData.folio}
              onChange={(e) => setFormData({...formData, folio: e.target.value})}
              placeholder="FAC-XXXX"
              className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-2xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Importe Neto Pagado</label>
            <div className="relative">
              <span className="absolute left-5 top-4 text-gray-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                className="w-full pl-10 pr-5 py-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-2xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">1. Confirmación de Pedido Pagado (PDF)</label>
              <div className={`p-6 border-2 border-dashed rounded-2xl text-center ${formData.paymentPdf ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 dark:border-gray-800'}`}>
                {formData.paymentPdf ? (
                   <div className="text-brand-green font-bold text-xs flex items-center justify-center gap-2">
                     📄 PDF Cargado
                     <button type="button" onClick={() => setFormData({...formData, paymentPdf: ''})} className="text-red-500">✕</button>
                   </div>
                ) : (
                  <label className="cursor-pointer">
                    <span className="text-brand-green font-bold text-xs">+ Seleccionar PDF</span>
                    <input type="file" accept=".pdf" className="sr-only" onChange={(e) => handlePdfUpload(e, 'paymentPdf')} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">2. Pedido Original (PDF)</label>
              <div className={`p-6 border-2 border-dashed rounded-2xl text-center ${formData.originalOrderPdf ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 dark:border-gray-800'}`}>
                {formData.originalOrderPdf ? (
                   <div className="text-brand-green font-bold text-xs flex items-center justify-center gap-2">
                     📄 PDF Cargado
                     <button type="button" onClick={() => setFormData({...formData, originalOrderPdf: ''})} className="text-red-500">✕</button>
                   </div>
                ) : (
                  <label className="cursor-pointer">
                    <span className="text-brand-green font-bold text-xs">+ Seleccionar PDF</span>
                    <input type="file" accept=".pdf" className="sr-only" onChange={(e) => handlePdfUpload(e, 'originalOrderPdf')} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Comentarios / Notas</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#333] dark:text-white rounded-2xl focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none resize-none font-medium"
              placeholder="Información adicional..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-brand-green hover:bg-brand-green-hover text-white text-sm font-black rounded-2xl shadow-xl shadow-brand-green/20 transform active:scale-[0.98] transition-all disabled:bg-gray-400 uppercase tracking-widest"
        >
          {isSubmitting ? 'Procesando...' : 'Solicitar Asignación de Puntos'}
        </button>
      </form>
    </div>
  );
};

export default OrdersAgentPage;
