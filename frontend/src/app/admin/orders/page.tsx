"use client";

import { useState, useEffect } from "react";
import { ordersApi } from "@/services/api";
import { Inbox, CreditCard, Hammer, Truck, CheckCircle2, X, ArrowRight, Eye } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import SearchBar from "@/components/admin/SearchBar";

const STATUS_CONFIG = [
    { value: "incoming", label: "Pedido Entrante", color: "bg-blue-100 text-blue-700 border-blue-300", icon: Inbox },
    { value: "pending_payment", label: "Pendiente de Pago", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: CreditCard },
    { value: "in_production", label: "En Fabricación", color: "bg-purple-100 text-purple-700 border-purple-300", icon: Hammer },
    { value: "shipped", label: "Enviado", color: "bg-indigo-100 text-indigo-700 border-indigo-300", icon: Truck },
    { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
];

const STATUS_FLOW: Record<string, string> = {
    incoming: "pending_payment",
    pending_payment: "in_production",
    in_production: "shipped",
    shipped: "delivered",
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("incoming");
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [confirmModal, setConfirmModal] = useState<{ order: any; nextStatus: string } | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = async () => {
        setLoading(true);
        const response = await ordersApi.list(page, search);
        const data = response.results || response;
        setOrders(data);
        if (response.count) {
            setTotalPages(Math.ceil(response.count / 10));
        }
        setLoading(false);
    };

    const handleAdvanceStatus = async (order: any) => {
        const nextStatus = STATUS_FLOW[order.status];
        if (!nextStatus) return;
        setConfirmModal({ order, nextStatus });
    };

    const confirmAdvance = async () => {
        if (!confirmModal) return;
        setLoading(true);
        await ordersApi.updateStatus(confirmModal.order.id, confirmModal.nextStatus);
        await loadData();
        setConfirmModal(null);
        if (selectedOrder?.id === confirmModal.order.id) {
            const updated = orders.find(o => o.id === confirmModal.order.id);
            setSelectedOrder(updated);
        }
        setLoading(false);
    };

    const handleCancel = async (orderId: number) => {
        if (!confirm("¿Cancelar esta orden?")) return;
        setLoading(true);
        await ordersApi.updateStatus(orderId, "cancelled");
        await loadData();
        setLoading(false);
    };

    const openDetail = (order: any) => {
        setSelectedOrder(order);
        setDetailModalOpen(true);
    };

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG.find(s => s.value === status) || STATUS_CONFIG[0];
    };

    const getNextStatusLabel = (status: string) => {
        const nextStatus = STATUS_FLOW[status];
        if (!nextStatus) return null;
        return getStatusConfig(nextStatus).label;
    };

    const filteredOrders = orders.filter(o => o.status === activeTab);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-serif tracking-tight text-[#111]">Órdenes</h2>
                    <p className="text-sm text-[#777] mt-1">{orders.length} órdenes totales</p>
                </div>
            </div>

            <div className="flex gap-4 items-center mb-6">
                <SearchBar 
                    value={search}
                    onChange={setSearch}
                    onSearch={() => { setPage(1); loadData(); }}
                    placeholder="Buscar por cliente, email..."
                />
                <button 
                    onClick={() => { setPage(1); loadData(); }}
                    className="px-6 py-2 bg-[#e2ded9] hover:bg-[#d8d4cf] font-medium rounded-lg transition-colors"
                >
                    Buscar
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {STATUS_CONFIG.map((status) => {
                    const count = orders.filter(o => o.status === status.value).length;
                    const Icon = status.icon;
                    return (
                        <button
                            key={status.value}
                            onClick={() => setActiveTab(status.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
                                activeTab === status.value
                                    ? `${status.color} border-current shadow-md`
                                    : "bg-white border-[#e8e4df] text-[#555] hover:border-[#e2ded9]"
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{status.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                activeTab === status.value ? "bg-white/50" : "bg-[#f5f2ef]"
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {loading && <div className="text-center py-8 text-[#777]">Cargando...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                    const config = getStatusConfig(order.status);
                    const nextLabel = getNextStatusLabel(order.status);
                    const Icon = config.icon;
                    return (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl border border-[#e8e4df] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className={`px-4 py-2 border-b ${config.color}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <span className="font-mono text-sm font-bold">#{order.id}</span>
                                    </div>
                                    <span className="text-xs font-medium">{config.label}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="mb-3">
                                    <div className="font-medium text-[#111]">{order.full_name}</div>
                                    <div className="text-sm text-[#777]">{order.email}</div>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[#777]">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="text-lg font-bold text-[#111]">${order.total_price}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openDetail(order)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-[#555] hover:bg-[#faf9f8] rounded-lg border border-[#e8e4df] transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver detalle
                                    </button>
                                    {nextLabel && (
                                        <button
                                            onClick={() => handleAdvanceStatus(order)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-white bg-[#111] hover:bg-[#C4612E] rounded-lg transition-colors font-medium"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                            {nextLabel}
                                        </button>
                                    )}
                                    {order.status !== "delivered" && (
                                        <button
                                            onClick={() => handleCancel(order.id)}
                                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                            title="Cancelar orden"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredOrders.length === 0 && !loading && (
                <div className="text-center py-16">
                    {(() => {
                        const Icon = getStatusConfig(activeTab).icon;
                        return <Icon className="w-16 h-16 text-[#ccc] mx-auto mb-4" />;
                    })()}
                    <p className="text-[#777]">No hay órdenes en "{getStatusConfig(activeTab).label}"</p>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            {detailModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#111]">Orden #{selectedOrder.id}</h3>
                            <button onClick={() => setDetailModalOpen(false)} className="text-[#999] hover:text-[#555]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#faf9f8] rounded-lg p-4">
                                <h4 className="font-semibold text-[#111] mb-3">Información del Cliente</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-[#777]">Nombre:</span> <span className="font-medium">{selectedOrder.full_name}</span></div>
                                    <div><span className="text-[#777]">Email:</span> <span className="font-medium">{selectedOrder.email}</span></div>
                                    <div><span className="text-[#777]">Dirección:</span> <span className="font-medium">{selectedOrder.address}</span></div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-[#111] mb-3">Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any) => (
                                        <div key={item.id} className="border border-[#e8e4df] rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-medium text-[#111]">{item.product_name}</div>
                                                    <div className="text-sm text-[#777]">Cantidad: {item.quantity}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-[#111]">${item.base_price}</div>
                                                </div>
                                            </div>
                                            {item.options?.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-stone-100">
                                                    <div className="text-xs text-[#777] mb-1">Opciones:</div>
                                                    {item.options.map((opt: any) => (
                                                        <div key={opt.id} className="text-sm text-[#555]">
                                                            • {opt.option_name}: {opt.value_name}
                                                            {opt.extra_price > 0 && <span className="text-[#111]"> (+${opt.extra_price})</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-[#e8e4df] pt-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-[#111]">${selectedOrder.total_price}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 py-4">
                                {STATUS_CONFIG.map((status, idx) => {
                                    const isCurrent = selectedOrder.status === status.value;
                                    const isPast = STATUS_CONFIG.findIndex(s => s.value === selectedOrder.status) > idx;
                                    return (
                                        <div key={status.value} className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                isCurrent ? "bg-[#111] text-white" :
                                                isPast ? "bg-green-500 text-white" :
                                                "bg-[#e2ded9] text-[#999]"
                                            }`}>
                                                {isPast ? "✓" : idx + 1}
                                            </div>
                                            {idx < STATUS_CONFIG.length - 1 && (
                                                <div className={`w-8 h-0.5 ${isPast ? "bg-green-500" : "bg-[#e2ded9]"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-[#111] mb-4">Confirmar cambio de estado</h3>
                        <p className="text-[#555] mb-6">
                            ¿Avanzar la orden <strong>#{confirmModal.order.id}</strong> de{" "}
                            <strong>{getStatusConfig(confirmModal.order.status).label}</strong> a{" "}
                            <strong>{getStatusConfig(confirmModal.nextStatus).label}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 px-4 py-2 text-stone-700 hover:bg-[#f5f2ef] rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmAdvance}
                                className="flex-1 px-4 py-2 bg-[#111] hover:bg-[#C4612E] text-white font-medium rounded-lg transition-colors"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
