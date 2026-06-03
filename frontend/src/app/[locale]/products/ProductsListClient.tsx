"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import { productsApi } from "@/services/api";
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
    const [activeImages, setActiveImages] = useState<Record<number, number>>({});
    const lastLoadedProducts = useRef<any[]>([]);

    useEffect(() => {
        loadProducts();
    }, [locale]);

    const loadProducts = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await productsApi.list(locale);
            const data = response.results || response;
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
        <main className="min-h-screen bg-stone-50" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
                .card-img { transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                .card-wrap:hover .card-img { transform: scale(1.08); }
                .card-overlay { transition: opacity 0.4s ease; }
                .card-wrap:hover .card-overlay { opacity: 1 !important; }
                .card-info { transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                .card-wrap:hover .card-info { transform: translateY(0) !important; }
                .card-cta { transition: opacity 0.3s ease 0.1s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.1s; }
                .card-wrap:hover .card-cta { opacity: 1 !important; transform: translateY(0) !important; }
                .card-border { transition: border-color 0.3s ease; }
                .card-wrap:hover .card-border { border-color: rgb(217 119 6) !important; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
                .anim-item { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
                .stagger-1 { animation-delay: 0.05s; }
                .stagger-2 { animation-delay: 0.12s; }
                .stagger-3 { animation-delay: 0.19s; }
                .stagger-4 { animation-delay: 0.26s; }
                .stagger-5 { animation-delay: 0.33s; }
                .stagger-6 { animation-delay: 0.40s; }
            `}</style>

            {/* ── HEADER ── */}
            <header className="relative overflow-hidden bg-amber-50 border-b border-amber-100">
                {/* Decorative large number */}
                <span
                    className="absolute -top-6 -right-4 text-amber-100 select-none pointer-events-none leading-none"
                    style={{ fontSize: "clamp(120px, 20vw, 220px)", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
                    aria-hidden
                >
                    {!loading && products.length > 0 ? products.length : ""}
                </span>

                <div className="relative max-w-7xl mx-auto px-8 pt-16 pb-14">
                    {/* Eyebrow */}
                    <p
                        className="text-amber-600 tracking-widest uppercase mb-4"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.2em" }}
                    >
                        {t("category")}
                    </p>

                    <div className="flex items-end justify-between gap-8 flex-wrap">
                        <h1
                            className="text-stone-900 leading-none"
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 300, letterSpacing: "-0.02em" }}
                        >
                            {t("title")}
                        </h1>
                    </div>

                    {/* Thin amber rule */}
                    <div className="mt-10 flex items-center gap-4">
                        <div className="h-px bg-amber-300 flex-1" />
                        <span
                            className="text-amber-500 shrink-0"
                            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}
                        >
                            {loading ? tCommon("loading") : `${products.length} ${products.length !== 1 ? t("title").toLowerCase() : t("title").toLowerCase()}`}
                        </span>
                        <div className="h-px bg-amber-300 w-8" />
                    </div>
                </div>
            </header>

            {/* ── BODY ── */}
            <div className="max-w-7xl mx-auto px-8 py-16">

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-5">
                        <div
                            className="w-10 h-10 rounded-full border-2 border-amber-200 border-t-amber-500"
                            style={{ animation: "spin 0.8s linear infinite" }}
                        />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        <p
                            className="text-stone-400 tracking-widest uppercase"
                            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.16em" }}
                        >
                            {tCommon("loading")}
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <svg className="w-16 h-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-stone-500" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
                            {tCommon("error")}
                        </p>
                        <button
                            onClick={loadProducts}
                            className="mt-2 px-5 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
                            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500 }}
                        >
                            {tCommon("retry")}
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <svg className="w-16 h-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p className="text-stone-400" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
                            {tCommon("error")}
                        </p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, idx) => (
                            <Link
                                key={product.id}
                                href={{ pathname: "/products/[id]" as const, params: { id: String(product.id) } }}
                                className={`group card-wrap block anim-item stagger-${Math.min(idx + 1, 6)}`}
                                onMouseEnter={() => setHoveredId(product.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <article
                                    className="card-border rounded-2xl overflow-hidden border border-stone-200 bg-white"
                                    style={{ boxShadow: hoveredId === product.id ? "0 20px 60px -12px rgba(120,80,0,0.18)" : "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.4s ease" }}
                                >
                                    {/* Image Carousel */}
                                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                                        {product.images?.length > 0 ? (
                                            <>
                                                <div className="w-full h-full relative">
                                                    {product.images.map((img: any, imgIdx: number) => (
                                                        <img
                                                            key={imgIdx}
                                                            src={img.image.startsWith("http") ? img.image : `http://127.0.0.1:8000${img.image}`}
                                                            alt={`${product.name} ${imgIdx + 1}`}
                                                            loading={idx < 3 && imgIdx === 0 ? "eager" : "lazy"}
                                                            className="card-img w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
                                                            style={{ opacity: (activeImages[product.id] || 0) === imgIdx ? 1 : 0 }}
                                                            draggable={false}
                                                        />
                                                    ))}
                                                </div>
                                                
                                                {product.images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const current = activeImages[product.id] || 0;
                                                                const prev = current === 0 ? product.images.length - 1 : current - 1;
                                                                setActiveImages({ ...activeImages, [product.id]: prev });
                                                            }}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white z-10"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const current = activeImages[product.id] || 0;
                                                                const next = current === product.images.length - 1 ? 0 : current + 1;
                                                                setActiveImages({ ...activeImages, [product.id]: next });
                                                            }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white z-10"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                                        </button>
                                                        
                                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                                            {product.images.map((_: any, dotIdx: number) => (
                                                                <button
                                                                    key={dotIdx}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setActiveImages({ ...activeImages, [product.id]: dotIdx });
                                                                    }}
                                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                                        (activeImages[product.id] || 0) === dotIdx
                                                                            ? "bg-white w-4"
                                                                            : "bg-white/50"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
                                                <svg className="w-16 h-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Gradient overlay */}
                                        <div
                                            className="card-overlay absolute inset-0 opacity-0"
                                            style={{ background: "linear-gradient(to top, rgba(28,18,8,0.72) 0%, rgba(28,18,8,0.2) 50%, transparent 100%)" }}
                                        />

                                        {/* Category pill — top left, always visible */}
                                        <div className="absolute top-3 left-3">
                                            <span
                                                className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-amber-700 rounded-full"
                                                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}
                                            >
                                                {product.category_name}
                                            </span>
                                        </div>

                                        {/* Price — top right, always visible */}
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className="inline-block px-3 py-1 bg-amber-500 text-white rounded-full"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: 500 }}
                                            >
                                                ${product.base_price}
                                            </span>
                                        </div>

                                        {/* Hover CTA text — rises from bottom on hover */}
                                        <div
                                            className="card-cta absolute bottom-4 left-0 right-0 flex justify-center opacity-0"
                                            style={{ transform: "translateY(8px)" }}
                                        >
                                            <span
                                                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-full"
                                                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 500, letterSpacing: "0.06em" }}
                                            >
                                                {t("viewDetails")}
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-5">
                                        <h3
                                            className="text-stone-900 mb-1 leading-snug transition-colors duration-200 group-hover:text-amber-700"
                                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 400 }}
                                        >
                                            {product.name}
                                        </h3>

                                        <p
                                            className="text-stone-500 line-clamp-2"
                                            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 300, lineHeight: 1.65 }}
                                        >
                                            {product.description}
                                        </p>

                                        {/* Footer rule + price */}
                                        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                                            <span
                                                className="text-stone-400"
                                                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}
                                            >
                                                {t("addToCart")}
                                            </span>
                                            <span
                                                className="text-amber-700"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 500, letterSpacing: "-0.01em" }}
                                            >
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

            {/* ── FOOTER RULE ── */}
            {!loading && !error && products.length > 0 && (
                <div className="max-w-7xl mx-auto px-8 pb-16">
                    <div className="flex items-center gap-4">
                        <div className="h-px bg-stone-200 flex-1" />
                        <span
                            className="text-stone-300 shrink-0"
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontStyle: "italic" }}
                        >
                            {t("title")}
                        </span>
                        <div className="h-px bg-stone-200 flex-1" />
                    </div>
                </div>
            )}
        </main>
    );
}
