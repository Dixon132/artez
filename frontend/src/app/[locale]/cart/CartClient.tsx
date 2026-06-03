"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cartApi, getSessionId, getAbsoluteMediaUrl } from "@/services/api";

export default function CartClient() {
    const router = useRouter();
    const t = useTranslations("cart");
    const tNav = useTranslations("navbar");
    const locale = useLocale();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, [locale]);

    const loadCart = async () => {
        setLoading(true);
        const sessionId = getSessionId();
        const data = await cartApi.get(sessionId, locale);
        setCart(data);
        setLoading(false);
    };

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        const sessionId = getSessionId();
        await cartApi.updateItem(sessionId, itemId, quantity);
        await loadCart();
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!confirm(t("removeConfirm"))) return;
        const sessionId = getSessionId();
        await cartApi.removeItem(sessionId, itemId);
        await loadCart();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
                <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
            </div>
        );
    }

    const isEmpty = !cart?.items || cart.items.length === 0;
    const totalItems = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

    const itemLabel = totalItems === 1
        ? (locale === "es" ? "producto" : locale === "fr" ? "produit" : "product")
        : (locale === "es" ? "productos" : locale === "fr" ? "produits" : "products");

    const eachLabel = locale === "es" ? "c/u" : locale === "fr" ? "ch." : "each";
    const shippingLabel = locale === "es" ? "Envío" : locale === "fr" ? "Livraison" : "Shipping";
    const freeLabel = locale === "es" ? "Gratis" : locale === "fr" ? "Gratuit" : "Free";
    const secureLabel = locale === "es" ? "Pago 100% Seguro" : locale === "fr" ? "Paiement 100% Sécurisé" : "100% Secure Checkout";

    return (
        <main className="min-h-screen bg-[#faf9f6] font-sans pb-24">
            {/* ── Premium Full-Width Cover ── */}
            <header className="relative w-full h-[280px] md:h-[350px] flex items-center justify-start overflow-hidden bg-stone-950 border-b border-amber-950/10">
                {/* Ambience & glowing lights */}
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-[#1a120b] to-[#120a05] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(217,119,6,0.12)_0%,transparent_60%)] pointer-events-none" />
                
                {/* Luxury string lines schema */}
                <div className="absolute inset-x-0 bottom-0 top-0 opacity-5 bg-[linear-gradient(to_right,rgba(217,119,6,0.1)_1px,transparent_1px)] bg-[size:3.5rem_100%] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full pt-8 flex flex-col items-start gap-4">
                    {/* Category/Context tracking */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-sans font-bold tracking-[0.16em] uppercase text-amber-400">
                            {tNav("cart")}
                        </span>
                    </div>

                    {/* Massive Serif Title */}
                    <h1 className="font-serif text-white text-4xl md:text-6xl font-light tracking-tight leading-tight max-w-4xl drop-shadow-lg flex items-baseline gap-4">
                        <span>{t("title")}</span>
                        {!isEmpty && (
                            <span className="inline-flex items-center justify-center text-xs font-sans font-semibold bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full backdrop-blur-md">
                                {totalItems} {itemLabel}
                            </span>
                        )}
                    </h1>
                </div>

                {/* Transition overlay curve */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#faf9f6] to-transparent pointer-events-none" />
            </header>

            <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
                {isEmpty ? (
                    <div className="max-w-md mx-auto text-center py-20 bg-white border border-stone-200/60 rounded-[2.5rem] p-8 shadow-xl shadow-stone-100/50">
                        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-amber-50/50 border border-amber-200/30">
                            <svg className="w-10 h-10 text-amber-800/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-35" />
                        </div>
                        <h3 className="font-serif text-2xl font-medium text-stone-800 mb-2">{t("empty")}</h3>
                        <p className="text-sm text-stone-500 font-light leading-relaxed mb-8">{t("emptyDescription")}</p>
                        <button
                            onClick={() => router.push("/products")}
                            className="inline-flex items-center justify-center px-8 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-sm font-semibold tracking-wide rounded-2xl transition-all duration-200 shadow-xl shadow-stone-900/10"
                        >
                            {t("viewProducts")}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* ── LEFT: Items List ── */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.items.map((item: any) => {
                                const itemTotal = (Number(item.product_price) + item.selected_options.reduce((acc: number, opt: any) => acc + Number(opt.extra_price), 0)) * item.quantity;
                                return (
                                    <div 
                                        key={item.id} 
                                        className="bg-white rounded-[2rem] border border-stone-200/60 p-5 md:p-6 flex flex-col sm:flex-row gap-6 shadow-xl shadow-stone-100/50 hover:shadow-2xl hover:shadow-stone-200/40 transition-all duration-300 relative group"
                                    >
                                        {/* Product image rounded container */}
                                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 shrink-0">
                                            {item.product_image ? (
                                                <Image
                                                    src={getAbsoluteMediaUrl(item.product_image)}
                                                    alt={item.product_name || "Product image"}
                                                    fill
                                                    sizes="(max-width: 640px) 96px, 112px"
                                                    loading="lazy"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zM9 10l12-3" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Core info */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-amber-800 transition-colors mb-1">
                                                    {item.product_name}
                                                </h3>
                                                
                                                {/* Selected Options chips */}
                                                {item.selected_options.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-3 mt-2">
                                                        {item.selected_options.map((opt: any) => (
                                                            <span 
                                                                key={opt.id}
                                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/50 text-[10px] font-sans font-medium text-stone-500"
                                                            >
                                                                <span className="text-stone-400">{opt.option_name}:</span> 
                                                                <span className="text-stone-700 font-semibold">{opt.value_name}</span>
                                                                {Number(opt.extra_price) > 0 && (
                                                                    <span className="text-amber-600 font-bold"> (+${opt.extra_price})</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity and Actions */}
                                            <div className="flex items-center justify-between sm:justify-start gap-6 mt-2">
                                                {/* Gold-ring quantity counter */}
                                                <div className="inline-flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        disabled={item.quantity <= 1}
                                                        className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                                                    </button>
                                                    <span className="min-w-[36px] text-center font-serif text-base font-semibold text-stone-900 border-x border-stone-100 leading-[36px]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                                    >
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                                    </button>
                                                </div>

                                                {/* Mini Trash Icon Button */}
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-red-50/50"
                                                    aria-label={t("remove")}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                                                    </svg>
                                                    <span className="font-medium">{t("remove")}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total price column */}
                                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1 sm:text-right shrink-0 pt-3 sm:pt-1 border-t sm:border-t-0 border-stone-100">
                                            <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-stone-400 block sm:hidden">Subtotal</span>
                                            <div className="flex flex-col sm:items-end">
                                                <span className="font-serif text-2xl font-semibold text-amber-900 tracking-tight">
                                                    ${itemTotal.toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-stone-400 font-sans mt-0.5">
                                                    ${(Number(item.product_price) + item.selected_options.reduce((acc: number, opt: any) => acc + Number(opt.extra_price), 0)).toFixed(2)} {eachLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── RIGHT: Summary Sidebar (Glassmorphic) ── */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/80 backdrop-blur-md border border-stone-200/60 rounded-[2.5rem] p-6 md:p-8 sticky top-6 shadow-2xl shadow-stone-100/40">
                                <h3 className="font-serif text-2xl font-light text-stone-900 mb-6">{t("summary")}</h3>
                                
                                <div className="space-y-4 mb-6 pb-6 border-b border-stone-150">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500 font-light">{t("subtotal")}</span>
                                        <span className="font-serif text-lg font-medium text-stone-900">${cart.total.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-xs text-stone-400 font-light">
                                        <span>{shippingLabel}</span>
                                        <span className="uppercase tracking-wider text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            {freeLabel}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline mb-8">
                                    <span className="text-stone-700 font-medium">{t("total")}</span>
                                    <span className="font-serif text-3xl font-bold text-amber-900">${cart.total.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={() => router.push("/checkout")}
                                    className="w-full flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-[15px] font-semibold tracking-wider transition-all duration-200 shadow-xl shadow-stone-900/10"
                                >
                                    <span>{t("checkout")}</span>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                {/* Security disclaimer */}
                                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-stone-400 font-sans uppercase tracking-widest">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-amber-600">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <span>{secureLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
