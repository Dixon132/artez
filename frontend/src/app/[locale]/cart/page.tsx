"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { cartApi, ordersApi, getSessionId } from "@/services/api";

export default function CartPage() {
    const params = useParams();
    const router = useRouter();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [form, setForm] = useState({ email: "", full_name: "", address: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        const sessionId = getSessionId();
        const data = await cartApi.get(sessionId);
        setCart(data);
        setLoading(false);
    };

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        const sessionId = getSessionId();
        await cartApi.updateItem(sessionId, itemId, quantity);
        await loadCart();
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!confirm("¿Eliminar este producto del carrito?")) return;
        const sessionId = getSessionId();
        await cartApi.removeItem(sessionId, itemId);
        await loadCart();
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const sessionId = getSessionId();
            await ordersApi.create({
                session_id: sessionId,
                ...form,
            });
            alert("¡Orden creada exitosamente!");
            router.push(`/${params.locale || 'es'}`);
        } catch (error) {
            alert("Error al crear la orden");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isEmpty = !cart?.items || cart.items.length === 0;

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold text-stone-900 mb-8">Carrito de Compras</h1>

                {isEmpty ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto mb-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-stone-700 mb-2">Tu carrito está vacío</h3>
                        <p className="text-stone-500 mb-6">Agrega productos para comenzar tu compra</p>
                        <button
                            onClick={() => router.push(`/${params.locale || 'es'}/products`)}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Ver productos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item: any) => {
                                const itemTotal = (Number(item.product_price) + item.selected_options.reduce((acc: number, opt: any) => acc + Number(opt.extra_price), 0)) * item.quantity;
                                return (
                                    <div key={item.id} className="bg-white rounded-xl border border-stone-200 p-6 flex gap-6">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-stone-900 mb-1">{item.product_name}</h3>
                                            <p className="text-sm text-stone-500 mb-2">${item.product_price}</p>
                                            {item.selected_options.length > 0 && (
                                                <div className="text-xs text-stone-600 mb-3">
                                                    {item.selected_options.map((opt: any) => (
                                                        <div key={opt.id}>
                                                            {opt.option_name}: {opt.value_name}
                                                            {Number(opt.extra_price) > 0 && <span className="text-amber-600"> (+${opt.extra_price})</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        className="w-8 h-8 rounded border border-stone-300 hover:border-amber-400 flex items-center justify-center"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded border border-stone-300 hover:border-amber-400 flex items-center justify-center"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-amber-600">${itemTotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resumen */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-6">
                                <h3 className="font-semibold text-stone-900 mb-4">Resumen</h3>
                                <div className="space-y-2 mb-4 pb-4 border-b border-stone-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-600">Subtotal</span>
                                        <span className="font-medium">${cart.total.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-lg font-bold mb-6">
                                    <span>Total</span>
                                    <span className="text-amber-600">${cart.total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => setCheckoutOpen(true)}
                                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Finalizar Compra
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Checkout */}
            {checkoutOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-4">Finalizar Compra</h3>
                        <form onSubmit={handleCheckout} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Dirección</label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCheckoutOpen(false)}
                                    className="flex-1 px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Procesando..." : "Confirmar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
