
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Order, OrderStatus, Customer } from '../types';

const ValidationAdminPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const allOrders = storageService.getOrders();
    setOrders(allOrders.filter(o => o.status === OrderStatus.PENDIENTE));
  }, []);

  const handleApprove = (order: Order) => {
    const config = storageService.getConfig();
    const points = Math.floor(order.amount / config.pointRatio);
    
    const allOrders = storageService.getOrders();
    const updatedOrders = allOrders.map(o => o.id === order.id ? { 
      ...o, 
      status: OrderStatus.APROBADO, 
      pointsAwarded: points 
    } : o);
    storageService.saveOrders(updatedOrders);

    const customers = storageService.getCustomers();
    const levels = storageService.getLevels();
    const updatedCustomers = customers.map(c => {
      if (c.id === order.customerId) {
        const newPoints = c.points + points;
        return {
          ...c,
          points: newPoints,
          level: storageService.calculateLevel(newPoints, levels)
        };
      }
      return c;
    });
    storageService.saveCustomers(updatedCustomers);

    setOrders(updatedOrders.filter(o => o.status === OrderStatus.PENDIENTE));
    setSelectedOrder(null);
    alert(`Pedido aprobado. Se asignaron ${points} puntos al cliente.`);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Debes ingresar un motivo de rechazo.');
      return;
    }

    if (selectedOrder) {
      const allOrders = storageService.getOrders();
      const updatedOrders = allOrders.map(o => o.id === selectedOrder.id ? { 
        ...o, 
        status: OrderStatus.RECHAZADO, 
        rejectionReason: rejectionReason 
      } : o);
      storageService.saveOrders(updatedOrders);

      setOrders(updatedOrders.filter(o => o.status === OrderStatus.PENDIENTE));
      setSelectedOrder(null);
      setRejectionReason('');
      setIsRejecting(false);
      alert('Pedido rechazado correctamente.');
    }
  };

  const openPdf = (base64: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black text-brand-dark dark:text-white tracking-tight">Validación de Puntos</h2>
           <p className="text-gray-500 dark:text-gray-400 font-medium">Revisión de documentación de agentes.</p>
        </div>
        <span className="bg-brand-green text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-green/20">
          {orders.length} Por validar
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => { setSelectedOrder(order); setIsRejecting(false); }}
              className={`w-full text-left p-6 rounded-[2rem] border transition-all ${
                selectedOrder?.id === order.id 
                  ? 'border-brand-green bg-brand-green/5 dark:bg-brand-green/10 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2a2a2a] hover:border-brand-green/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{order.folio}</span>
                <span className="text-xs font-black text-brand-green">${order.amount.toLocaleString()}</span>
              </div>
              <p className="font-black text-gray-900 dark:text-white truncate">{order.customerName}</p>
            </button>
          ))}
          {orders.length === 0 && (
            <div className="bg-white dark:bg-[#2a2a2a] p-12 rounded-[2rem] border border-gray-100 dark:border-gray-800 text-center text-gray-400 font-black uppercase tracking-widest">
              Todo validado ✅
            </div>
          )}
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white dark:bg-[#2a2a2a] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full transition-all">
              <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-black dark:text-white">Documentación Adjunta</h3>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">1. Confirmación de Pago</label>
                        <button 
                            onClick={() => openPdf(selectedOrder.paymentPdf)}
                            className="w-full h-40 border-2 border-brand-green/20 rounded-2xl flex flex-col items-center justify-center gap-3 bg-brand-green/5 hover:bg-brand-green/10 transition-all group"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
                            <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Ver Documento</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">2. Pedido Original</label>
                        <button 
                            onClick={() => openPdf(selectedOrder.originalOrderPdf)}
                            className="w-full h-40 border-2 border-brand-green/20 rounded-2xl flex flex-col items-center justify-center gap-3 bg-brand-green/5 hover:bg-brand-green/10 transition-all group"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform">📋</span>
                            <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">Ver Documento</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#333] p-6 rounded-3xl">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Monto a validar</label>
                            <p className="text-2xl font-black text-brand-green">${selectedOrder.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Puntos potenciales</label>
                            <p className="text-2xl font-black text-brand-dark dark:text-white">{Math.floor(selectedOrder.amount / storageService.getConfig().pointRatio)} pts</p>
                        </div>
                    </div>
                    {selectedOrder.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Notas del agente</label>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{selectedOrder.notes}"</p>
                        </div>
                    )}
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#252525] flex flex-col md:flex-row gap-4">
                {isRejecting ? (
                  <div className="flex-1 space-y-4 animate-in slide-in-from-bottom-2">
                    <textarea
                      placeholder="Motivo del rechazo..."
                      className="w-full p-4 border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#2a2a2a] dark:text-white rounded-2xl outline-none"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsRejecting(false)} className="px-6 py-2 text-gray-500 text-[10px] font-black uppercase">Cancelar</button>
                      <button onClick={handleReject} className="px-8 py-3 bg-red-600 text-white font-black rounded-xl text-[10px] uppercase">Rechazar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setIsRejecting(true)} className="flex-1 py-4 text-red-600 font-black rounded-2xl border border-red-200 text-xs uppercase tracking-widest">Rechazar</button>
                    <button onClick={() => handleApprove(selectedOrder)} className="flex-[2] py-4 bg-brand-green text-white font-black rounded-2xl shadow-xl shadow-brand-green/20 text-xs uppercase tracking-widest">Validar y asignar</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white dark:bg-[#2a2a2a] rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center p-16 text-center text-gray-400">
              <div className="text-7xl mb-6">🔍</div>
              <p className="font-black uppercase tracking-widest text-sm">Selecciona una solicitud pendiente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationAdminPage;
