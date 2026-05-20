"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { productsApi, cartApi, getSessionId, getAbsoluteMediaUrl } from "@/services/api";
import Image from "next/image";
import gsap from "gsap";
import { gaViewItem, gaAddToCart } from "@/lib/analytics";
import { fbViewContent, fbAddToCart } from "@/lib/fbpixel";

export default function ProductDetailClient() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("products");
    const locale = useLocale();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [adding, setAdding] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<Record<number, any>>({});
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const touchStartY = useRef(0);
    const infoRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const lastLoadedProduct = useRef<any>(null);

    // ── Load product ──────────────────────────────────────────────────────────
    const loadProduct = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await productsApi.get(Number(params.id), locale);
            setProduct(data);
            lastLoadedProduct.current = data;
            setActiveImage(0);
            if (data) {
                gaViewItem(data);
                fbViewContent(data);
            }
        } catch {
            if (lastLoadedProduct.current) {
                setProduct(lastLoadedProduct.current);
            } else {
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    }, [params.id, locale]);

    useEffect(() => { loadProduct(); }, [loadProduct]);

    // ── Entrance animations ───────────────────────────────────────────────────
    useEffect(() => {
        if (loading || !product) return;

        if (galleryRef.current) {
            gsap.fromTo(
                galleryRef.current,
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
            );
        }

        if (infoRef.current) {
            const children = Array.from(infoRef.current.children);
            if (children.length > 0) {
                gsap.fromTo(
                    children,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.2 }
                );
            }
        }
    }, [loading, product]);

    // ── Derived values ────────────────────────────────────────────────────────
    const calculateTotal = useCallback(() => {
        if (!product) return 0;
        let total = Number(product.base_price);
        Object.values(selectedOptions).forEach((val: any) => {
            if (val) total += Number(val.base_extra_price);
        });
        return total * quantity;
    }, [product, selectedOptions, quantity]);

    // ── Add to cart ───────────────────────────────────────────────────────────
    const handleAddToCart = useCallback(async () => {
        if (!product) return;
        const missing = product.product_options?.filter(
            (po: any) => !selectedOptions[po.option.id]
        );
        if (missing?.length > 0) {
            alert(t("selectAllOptions"));
            return;
        }
        setAdding(true);
        try {
            const sessionId = getSessionId();
            const options = Object.entries(selectedOptions).map(([optionId, value]: any) => ({
                option_id: Number(optionId),
                value_id: value.id,
            }));
            await cartApi.addItem({ session_id: sessionId, product_id: product.id, quantity, options });

            const total = calculateTotal();
            gaAddToCart(product, quantity, total);
            fbAddToCart(product, quantity, total);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } finally {
            setAdding(false);
        }
    }, [product, selectedOptions, quantity, calculateTotal, t]);

    // ── Gallery navigation ────────────────────────────────────────────────────
    const images = product?.images ?? [];
    const canGoUp = activeImage > 0;
    const canGoDown = activeImage < images.length - 1;

    const goUp = useCallback(() => setActiveImage(i => Math.max(0, i - 1)), []);
    const goDown = useCallback(() => setActiveImage(i => Math.min(images.length - 1, i + 1)), [images.length]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY > 0) goDown(); else goUp();
    }, [goDown, goUp]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (diff > 40) goDown();
        else if (diff < -40) goUp();
    }, [goDown, goUp]);

    // ── States ────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
            <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-amber-600 animate-spin" />
        </div>
    );

    if (error && !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#fafaf8]">
            <h2 className="text-xl font-medium text-stone-800">{t("errorLoading")}</h2>
            <button
                onClick={loadProduct}
                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
                {t("retryLoad")}
            </button>
            <button
                onClick={() => router.push("/products")}
                className="text-amber-600 hover:text-amber-700 text-sm underline underline-offset-2 transition-colors"
            >
                {t("backToProducts")}
            </button>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#fafaf8]">
            <h2 className="text-xl font-medium text-stone-800">{t("notFound")}</h2>
            <button
                onClick={() => router.push("/products")}
                className="text-amber-600 hover:text-amber-700 text-sm underline underline-offset-2 transition-colors"
            >
                {t("backToProducts")}
            </button>
        </div>
    );

    const total = calculateTotal();

    return (
        <>
            {/* ── Toast ── */}
            <div
                className={[
                    "fixed top-24 right-6 z-50",
                    "bg-stone-900 text-white font-sans text-sm font-medium",
                    "flex items-center gap-2.5 px-6 py-4 rounded-2xl border border-stone-800",
                    "shadow-2xl shadow-stone-950/20 pointer-events-none",
                    "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    showSuccess ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0",
                ].join(" ")}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="text-emerald-500">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
                {t("addedToCart")}
            </div>

            {/* ── Main ── */}
            <main className="min-h-screen bg-[#faf9f6] font-cormorant pb-24">
                {/* Dynamic Full-Width Cover (Portada) */}
                <header className="relative w-full h-[360px] md:h-[450px] flex items-center justify-start overflow-hidden bg-stone-950 border-b border-amber-950/10">
                    {/* Blurred dynamic instrument background */}
                    {images?.[0] && (
                        <div className="absolute inset-0 select-none pointer-events-none scale-105 opacity-25 blur-3xl transition-transform duration-700">
                            <Image
                                src={getAbsoluteMediaUrl(images[0].image)}
                                alt=""
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                    
                    {/* Dark gradient & lighting overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-[#16100c]/80 to-[#faf9f6] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(217,119,6,0.15)_0%,transparent_60%)] pointer-events-none" />
                    
                    {/* Luxury string lines schema */}
                    <div className="absolute inset-x-0 bottom-0 top-0 opacity-5 bg-[linear-gradient(to_right,rgba(217,119,6,0.1)_1px,transparent_1px)] bg-[size:3.5rem_100%] pointer-events-none" />

                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full pt-16 flex flex-col items-start gap-4">
                        {/* Minimalist Back Button */}
                        <button
                            onClick={() => router.push("/products")}
                            className="group inline-flex items-center gap-2.5 text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-stone-400 hover:text-amber-400 transition-colors w-fit mb-3"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="group-hover:-translate-x-1.5 transition-transform duration-300">
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                            {t("backToProducts")}
                        </button>

                        {/* Category badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[9px] font-sans font-bold tracking-[0.16em] uppercase text-amber-400">
                                {product.category_name}
                            </span>
                        </div>

                        {/* Giant Name */}
                        <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-extralight tracking-tight leading-tight max-w-4xl drop-shadow-lg">
                            {product.name}
                        </h1>
                    </div>

                    {/* Transition overlay curve */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#faf9f6] to-transparent pointer-events-none" />
                </header>

                {/* Content Grid */}
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* ── Gallery ── */}
                    <div ref={galleryRef} className="lg:sticky lg:top-24 flex flex-col items-center gap-4 relative">

                        {/* Up arrow */}
                        <button
                            onClick={goUp}
                            aria-label="Previous image"
                            className={[
                                "w-11 h-11 rounded-full border border-stone-200 bg-white/95 backdrop-blur-sm",
                                "flex items-center justify-center text-stone-500",
                                "shadow-sm hover:border-amber-500 hover:text-amber-600",
                                "hover:-translate-y-0.5 hover:shadow-amber-100 hover:shadow-md",
                                "transition-all duration-200",
                                !canGoUp ? "opacity-0 pointer-events-none" : "",
                            ].join(" ")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M18 15l-6-6-6 6" />
                            </svg>
                        </button>

                        {/* Viewport */}
                        <div
                            className="w-full h-[420px] md:h-[560px] lg:h-[620px] overflow-hidden rounded-[2.5rem] border border-stone-200/50 shadow-2xl shadow-stone-200/70 bg-stone-50 relative group"
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div
                                className="flex flex-col gap-3 h-full transition-transform duration-[600ms] ease-[cubic-bezier(0.77,0,0.18,1)] will-change-transform"
                                style={{ transform: `translateY(calc(-${activeImage} * (100% + 12px)))` }}
                            >
                                {images.length > 0 ? images.map((img: any, i: number) => (
                                    <div key={i} className="flex-shrink-0 w-full h-full rounded-[2.5rem] overflow-hidden relative">
                                        <Image
                                            src={getAbsoluteMediaUrl(img.image)}
                                            alt={`${product.name} - image ${i + 1}`}
                                            priority={i === 0}
                                            loading={i === 0 ? undefined : "lazy"}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                )) : (
                                    <div className="flex-shrink-0 w-full h-full rounded-[2.5rem] bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-stone-300">
                                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                                            <path d="M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Down arrow */}
                        <button
                            onClick={goDown}
                            aria-label="Next image"
                            className={[
                                "w-11 h-11 rounded-full border border-stone-200 bg-white/95 backdrop-blur-sm",
                                "flex items-center justify-center text-stone-500",
                                "shadow-sm hover:border-amber-500 hover:text-amber-600",
                                "hover:translate-y-0.5 hover:shadow-amber-100 hover:shadow-md",
                                "transition-all duration-200 z-10",
                                !canGoDown ? "opacity-0 pointer-events-none" : "",
                            ].join(" ")}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {/* Pip track */}
                        {images.length > 1 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 items-center bg-white/95 border border-stone-200/40 px-2 py-3 rounded-2xl shadow-md z-10">
                                {images.map((_: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        aria-label={`Image ${i + 1}`}
                                        className={[
                                            "rounded-full border-none transition-all duration-300",
                                            activeImage === i
                                                ? "w-1.5 h-7 bg-amber-600 shadow-amber-300/50 shadow-sm"
                                                : "w-1.5 h-1.5 bg-stone-300 hover:bg-amber-500 hover:scale-125",
                                        ].join(" ")}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-[68px] left-5 flex items-baseline gap-1 bg-stone-900/90 border border-stone-800 text-white rounded-full px-3.5 py-1.5 pointer-events-none shadow-md">
                                <span className="text-sm font-semibold text-amber-400">{activeImage + 1}</span>
                                <span className="text-xs text-stone-500">/</span>
                                <span className="text-xs text-stone-400">{images.length}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Info ── */}
                    <div ref={infoRef} className="flex flex-col gap-8 bg-white border border-stone-200/55 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-stone-100/40">

                        {/* Price Block */}
                        <div className="bg-gradient-to-br from-[#faf8f5] to-amber-50 border border-amber-200/60 rounded-3xl px-6 py-5 shadow-sm">
                            <p className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-amber-700/70 mb-1">{t("total") ?? "Total"}</p>
                            <span className="font-serif text-5xl font-semibold text-amber-900 tracking-tight leading-none">
                                ${total.toFixed(2)}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-[15px] leading-relaxed text-stone-500">
                            {product.description}
                        </p>

                        <hr className="border-stone-100" />

                        {/* Options */}
                        {product.product_options?.length > 0 && (
                            <div className="flex flex-col gap-5">
                                {product.product_options.map((po: any) => {
                                    const opt = po.option;
                                    return (
                                        <div key={opt.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
                                            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-stone-400 mb-3">
                                                {opt.name}
                                            </p>
                                            <div className="flex flex-wrap gap-2.5">
                                                {opt.values.map((val: any) => {
                                                    const sel = selectedOptions[opt.id]?.id === val.id;
                                                    const hasImage = !!val.image;
                                                    return (
                                                        <button
                                                            key={val.id}
                                                            onClick={() =>
                                                                setSelectedOptions(prev => ({
                                                                    ...prev,
                                                                    [opt.id]: sel ? null : val,
                                                                }))
                                                            }
                                                            className={[
                                                                "inline-flex items-center gap-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 overflow-hidden",
                                                                hasImage ? "pl-0 pr-4 py-0" : "px-5 py-2.5",
                                                                sel
                                                                    ? "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-900 font-semibold shadow-amber-100 shadow-md"
                                                                    : "border-stone-200 bg-white text-stone-700 hover:border-amber-400 hover:text-amber-800 hover:-translate-y-0.5 hover:shadow-amber-50 hover:shadow-md",
                                                            ].join(" ")}
                                                        >
                                                            {hasImage && (
                                                                <img
                                                                    src={val.image.startsWith("http") ? val.image : `http://127.0.0.1:8000${val.image}`}
                                                                    alt={`${opt.name}: ${val.name}`}
                                                                    width={48}
                                                                    height={48}
                                                                    loading="lazy"
                                                                    className="w-12 h-12 object-cover rounded-l-[10px]"
                                                                />
                                                            )}
                                                            <span>{val.name}</span>
                                                            {Number(val.base_extra_price) > 0 && (
                                                                <span className="text-xs text-stone-400 font-medium">
                                                                    +${val.base_extra_price}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-stone-400 mb-3">
                                {t("quantity")}
                            </p>
                            <div className="inline-flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    aria-label={t("quantity") + " -"}
                                    className="w-11 h-11 flex items-center justify-center text-stone-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                                </button>
                                <span className="min-w-[50px] text-center font-serif text-[22px] font-semibold text-stone-900 border-x-2 border-stone-100 leading-[44px]">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    aria-label={t("quantity") + " +"}
                                    className="w-11 h-11 flex items-center justify-center text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="w-full flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[15px] font-semibold tracking-wide transition-all duration-200 shadow-xl shadow-stone-900/20 hover:shadow-stone-900/30"
                        >
                            {adding ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    {t("adding")}
                                </>
                            ) : (
                                <>
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                                    </svg>
                                    {t("addToCart")}
                                </>
                            )}
                        </button>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-5 bg-stone-50 border border-stone-100 rounded-2xl p-5">
                            {([
                                { path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: t("securePay") },
                                { path: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: t("fastShipping") },
                                { path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: t("returns") },
                            ] as { path: string; label: string }[]).map(({ path, label }) => (
                                <div key={label} className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-600">
                                        <path d={path} />
                                    </svg>
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}