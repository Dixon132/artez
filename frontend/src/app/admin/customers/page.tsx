"use client";

import { useState, useEffect } from "react";
import { ordersApi } from "@/services/api";

export default function AdminCustomersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const ordersData = await ordersApi.list();
        setOrders(ordersData);

        // Agrupar órdenes por cliente
        const customersMap = new Map();
        ordersData.forEach((order: any) => {
            const key = order.email;
            if (!customersMap.has(key)) {
                customersMap.set(key, {
                    email: order.email,
                    full_name: order.full_name,
                    orders: [],
                    total_spent: 0,
                });
            }
            const customer = customersMap.get(key);
            customer.orders.push(order);
            customer.total_spent += Number(order.total_price);
        });

        setCustomers(Array.from(customersMap.values()));
        setLoading(false);
    };

    const openDetail = (customer: any) => {
        setSelectedCustomer(customer);
        setDetailModalOpen(true);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900">Clientes</h2>
                    <p className="text-sm text-stone-500 mt-1">{customers.length} clientes únicos</p>
                </div>
            </div>

            {loading && <div className="text-center py-8 text-stone-500">Cargando...</div>}

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Órdenes</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase">Total Gastado</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {customers.map((customer, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-stone-900">{customer.full_name}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-stone-600">{customer.email}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                        {customer.orders.length} {customer.orders.length === 1 ? 'orden' : 'órdenes'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-amber-600">
                                    ${customer.total_spent.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openDetail(customer)}
                                        className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    >
                                        Ver órdenes
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                                    No hay clientes registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detalle */}
            {detailModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-stone-900">{selectedCustomer.full_name}</h3>
                                <p className="text-sm text-stone-500">{selectedCustomer.email}</p>
                            </div>
                            <button onClick={() => setDetailModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div className="bg-amber-50 rounded-lg p-4">
                                <div className="text-sm text-stone-600 mb-1">Total de Órdenes</div>
                                <div className="text-2xl font-bold text-stone-900">{selectedCustomer.orders.length}</div>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-4">
                                <div className="text-sm text-stone-600 mb-1">Total Gastado</div>
                                <div className="text-2xl font-bold text-amber-600">${selectedCustomer.total_spent.toFixed(2)}</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-stone-900 mb-3">Historial de Órdenes</h4>
                            <div className="space-y-3">
                                {selectedCustomer.orders.map((order: any) => (
                                    <div key={order.id} className="border border-stone-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium text-stone-900">Orden #{order.id}</div>
                                                <div className="text-xs text-stone-500">
                                                    {new Date(order.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-amber-600">${order.total_price}</div>
                                                <div className="text-xs text-stone-500 mt-1">{order.status_display}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-stone-100">
                                            <div className="text-xs text-stone-500 mb-1">Dirección de envío:</div>
                                            <div className="text-sm text-stone-600">{order.address}</div>
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-xs text-stone-500 mb-1">Items:</div>
                                            <div className="text-sm text-stone-600">
                                                {order.items?.map((item: any, idx: number) => (
                                                    <div key={idx}>• {item.product_name} (x{item.quantity})</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
