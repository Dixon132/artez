"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { ordersApi } from "@/services/api";
import { gaPurchase } from "@/lib/analytics";
import { fbPurchase } from "@/lib/fbpixel";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order");
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        setLoading(true);
        try {
            const data = await ordersApi.get(Number(orderId));
            setOrder(data);
            
            // Track purchase
            if (data) {
                gaPurchase(data);
                fbPurchase(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50 py-16 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">¡Orden confirmada!</h1>
                        <p className="text-green-50">Tu pedido ha sido recibido exitosamente</p>
                    </div>

                    <div className="p-8">
                        {order && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-200">
                                    <div>
                                        <p className="text-sm text-stone-500 mb-1">Número de orden</p>
                                        <p className="text-2xl font-bold text-stone-900">#{order.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-stone-500 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-amber-600">${order.total_price}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-stone-900">{order.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Nombre</p>
                                        <p className="text-stone-900">{order.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Dirección</p>
                                        <p className="text-stone-900">{order.address}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                            <div className="flex gap-3">
                                <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-amber-900 mb-2">¿Qué sigue?</h3>
                                    <ul className="text-sm text-amber-800 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>Recibirás un email de confirmación en los próximos minutos</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>Nuestro equipo revisará tu pedido y se pondrá en contacto contigo en las próximas 24 horas</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>Te enviaremos instrucciones para completar el pago y coordinar el envío</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push("/products")}
                                className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors"
                            >
                                Seguir comprando
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="flex-1 py-3 bg-white border-2 border-stone-300 hover:border-stone-400 text-stone-700 font-medium rounded-lg transition-colors"
                            >
                                Ir al inicio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
