"use client";

import { useState, useEffect } from "react";
import { ordersApi } from "@/services/api";

const STATUS_OPTIONS = [
    { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    { value: "processing", label: "Procesando", color: "bg-blue-100 text-blue-700" },
    { value: "shipped", label: "Enviado", color: "bg-purple-100 text-purple-700" },
    { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-700" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-700" },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await ordersApi.list();
        setOrders(data);
        setLoading(false);
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        setLoading(true);
        await ordersApi.updateStatus(orderId, newStatus);
        await loadData();
        if (selectedOrder?.id === orderId) {
            const updated = orders.find(o => o.id === orderId);
            setSelectedOrder(updated);
        }
    };

    const openDetail = (order: any) => {
        setSelectedOrder(order);
        setDetailModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-700";
    };

    const getStatusLabel = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900">Órdenes</h2>
                    <p className="text-sm text-stone-500 mt-1">{orders.length} órdenes</p>
                </div>
            </div>

            {loading && <div className="text-center py-8 text-stone-500">Cargando...</div>}

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-amber-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-stone-400 font-mono">#{order.id}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-stone-900">{order.full_name}</div>
                                    <div className="text-xs text-stone-500">{order.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-amber-600">${order.total_price}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} border-0 cursor-pointer`}
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-sm text-stone-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openDetail(order)}
                                        className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    >
                                        Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Detalle */}
            {detailModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-stone-900">Orden #{selectedOrder.id}</h3>
                            <button onClick={() => setDetailModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-stone-50 rounded-lg p-4">
                                <h4 className="font-semibold text-stone-900 mb-3">Información del Cliente</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-stone-500">Nombre:</span> <span className="font-medium">{selectedOrder.full_name}</span></div>
                                    <div><span className="text-stone-500">Email:</span> <span className="font-medium">{selectedOrder.email}</span></div>
                                    <div><span className="text-stone-500">Dirección:</span> <span className="font-medium">{selectedOrder.address}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-stone-900 mb-3">Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any) => (
                                        <div key={item.id} className="border border-stone-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-medium text-stone-900">{item.product_name}</div>
                                                    <div className="text-sm text-stone-500">Cantidad: {item.quantity}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-amber-600">${item.base_price}</div>
                                                </div>
                                            </div>
                                            {item.options?.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-stone-100">
                                                    <div className="text-xs text-stone-500 mb-1">Opciones:</div>
                                                    {item.options.map((opt: any) => (
                                                        <div key={opt.id} className="text-sm text-stone-600">
                                                            • {opt.option_name}: {opt.value_name} 
                                                            {opt.extra_price > 0 && <span className="text-amber-600"> (+${opt.extra_price})</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-stone-200 pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-amber-600">${selectedOrder.total_price}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Cambiar Estado</label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    {STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
