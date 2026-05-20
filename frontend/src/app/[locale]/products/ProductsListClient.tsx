"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import Image from "next/image";
import { productsApi, getAbsoluteMediaUrl } from "@/services/api";
import { gaViewItemList } from "@/lib/analytics";
import { fbPageview } from "@/lib/fbpixel";

export default function ProductsListClient() {
    const t = useTranslations("products");
    const tCommon = useTranslations("common");
    const locale = useLocale();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const lastLoadedProducts = useRef<any[]>([]);

    useEffect(() => {
        loadProducts();
    }, [locale]);

    const loadProducts = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await productsApi.list(locale);
            setProducts(data);
            lastLoadedProducts.current = data;

            // Track view item list
            if (data.length > 0) {
                gaViewItemList(data);
                fbPageview();
            }
        } catch {
            // On failure, show last loaded content or error state
            if (lastLoadedProducts.current.length > 0) {
                setProducts(lastLoadedProducts.current);
            } else {
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#faf9f6] font-cormorant pb-24">
            <style>{`
                .card-img { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                .card-wrap:hover .card-img { transform: scale(1.06); }
                .card-overlay { transition: opacity 0.5s ease; }
                .card-wrap:hover .card-overlay { opacity: 1 !important; }
                .card-cta { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .card-wrap:hover .card-cta { opacity: 1 !important; transform: translateY(0) !important; }
                .card-border { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .card-wrap:hover .card-border { border-color: rgba(217, 119, 6, 0.3) !important; box-shadow: 0 30px 70px -10px rgba(45,28,12,0.12) !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                .anim-item { opacity: 0; animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .stagger-1 { animation-delay: 0.05s; }
                .stagger-2 { animation-delay: 0.12s; }
                .stagger-3 { animation-delay: 0.19s; }
                .stagger-4 { animation-delay: 0.26s; }
                .stagger-5 { animation-delay: 0.33s; }
                .stagger-6 { animation-delay: 0.40s; }
            `}</style>

            {/* ── LUXURY PORTADA (HERO BANNER) ── */}
            <header className="relative w-full h-[360px] md:h-[450px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-950 via-[#1e150f] to-[#120a05] border-b border-amber-950/20">
                {/* Luthier Ambient Lighting & Glows */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,119,6,0.18)_0%,transparent_60%)] pointer-events-none" />
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
                
                {/* Decorative schematic string-lines */}
                <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-[linear-gradient(to_right,rgba(217,119,6,0.15)_1px,transparent_1px)] bg-[size:4rem_100%] pointer-events-none" />

                {/* Floating Glassmorphic Container */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 mb-6 rounded-full bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-semibold font-sans tracking-[0.25em] text-amber-400 uppercase">
                            {t("category")}
                        </span>
                    </div>

                    <h1 className="font-serif text-white text-5xl md:text-7xl font-extralight tracking-tight leading-tight mb-4 drop-shadow-xl">
                        {t("title")}
                    </h1>

                    {/* Decorative Divider */}
                    <div className="flex items-center justify-center gap-4 max-w-xs mx-auto mt-6 mb-3">
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1" />
                        <span className="text-amber-500/70 text-[10px] font-sans tracking-[0.15em] uppercase font-light shrink-0">
                            {loading ? tCommon("loading") : `${products.length} ${t("title").toLowerCase()}`}
                        </span>
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent flex-1" />
                    </div>
                </div>

                {/* Bottom elegant curve overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#faf9f6] to-transparent pointer-events-none" />
            </header>

            {/* ── GRID OF PRODUCTS ── */}
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
                            <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
                        </div>
                        <p className="text-stone-400 font-sans tracking-[0.15em] uppercase text-[10px] font-medium">
                            {tCommon("loading")}
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-24 gap-5 bg-white border border-stone-200/80 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-stone-600 text-sm font-sans font-light text-center">
                            {tCommon("error")}
                        </p>
                        <button
                            onClick={loadProducts}
                            className="px-6 py-2.5 bg-amber-600 text-white font-sans text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-amber-700 active:scale-95 transition-all duration-250 shadow-md shadow-amber-600/10"
                        >
                            {tCommon("retry")}
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-stone-200/80 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                        <svg className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p className="text-stone-500 font-sans text-sm font-light">
                            {tCommon("error")}
                        </p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {products.map((product, idx) => (
                            <Link
                                key={product.id}
                                href={{ pathname: "/products/[id]" as const, params: { id: String(product.id) } }}
                                className={`group card-wrap block anim-item stagger-${Math.min(idx + 1, 6)}`}
                                onMouseEnter={() => setHoveredId(product.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <article className="card-border rounded-[2.5rem] overflow-hidden border border-stone-200/60 bg-white shadow-xl shadow-stone-100/40">
                                    {/* Image Container with high aspect ratio */}
                                    <div className="relative overflow-hidden bg-stone-50" style={{ aspectRatio: "4/3.2" }}>
                                        {product.images?.[0] ? (
                                            <Image
                                                src={getAbsoluteMediaUrl(product.images[0].image)}
                                                alt={product.name || "Handcrafted instrument"}
                                                priority={idx < 3}
                                                loading={idx < 3 ? undefined : "lazy"}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="card-img object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-stone-300">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Luxury linear dark overlay */}
                                        <div
                                            className="card-overlay absolute inset-0 opacity-0 bg-gradient-to-t from-stone-950/80 via-stone-900/10 to-transparent"
                                            style={{ transition: "opacity 0.4s ease" }}
                                        />

                                        {/* Category label */}
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-block px-3.5 py-1.5 bg-stone-950/70 backdrop-blur-md text-amber-400/90 rounded-full border border-amber-500/20 text-[9px] font-semibold font-sans tracking-[0.14em] uppercase shadow-sm">
                                                {product.category_name}
                                            </span>
                                        </div>

                                        {/* Hover CTA Button */}
                                        <div
                                            className="card-cta absolute bottom-5 left-0 right-0 flex justify-center opacity-0 translate-y-3 pointer-events-none"
                                        >
                                            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-full font-sans text-xs font-semibold tracking-wider uppercase shadow-lg shadow-amber-950/30 hover:bg-amber-700 transition-colors">
                                                {t("viewDetails")}
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-6 md:p-7 bg-white">
                                        <h2 className="text-stone-950 font-serif text-2xl lg:text-3xl font-medium tracking-tight mb-2.5 leading-snug group-hover:text-amber-800 transition-colors duration-300">
                                            {product.name}
                                        </h2>

                                        <p className="text-stone-500 font-sans text-[13px] font-light leading-relaxed line-clamp-2 mb-6">
                                            {product.description}
                                        </p>

                                        {/* Footer divider and price */}
                                        <div className="pt-5 border-t border-stone-100 flex items-center justify-between">
                                            <span className="text-stone-400 font-sans text-[9px] font-bold tracking-[0.15em] uppercase">
                                                {t("addToCart")}
                                            </span>
                                            <span className="text-amber-700 font-serif text-3xl font-semibold tracking-tight">
                                                ${product.base_price}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ── FOOTER DECORATION ── */}
            {!loading && !error && products.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 md:px-8 mt-12">
                    <div className="flex items-center gap-5">
                        <div className="h-px bg-gradient-to-r from-transparent to-stone-200 flex-1" />
                        <span className="text-stone-300 font-serif text-sm font-light italic shrink-0">
                            {t("title")}
                        </span>
                        <div className="h-px bg-gradient-to-l from-transparent to-stone-200 flex-1" />
                    </div>
                </div>
            )}
        </main>
    );
}
