"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/navigation";
import { productsApi, getAbsoluteMediaUrl } from "@/services/api";
import { gaViewItemList } from "@/lib/analytics";
import { fbPageview } from "@/lib/fbpixel";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function getImg(img: any) {
    if (!img) return null;
    const url = img.image || img;
    if (!url) return null;
    return url.startsWith("http") ? url : `${BACKEND}${url}`;
}

/** Truncate a string to maxLen chars, appending "…" if cut. */
function excerpt(text: string | undefined | null, maxLen = 80): string {
    if (!text) return "";
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length <= maxLen) return cleaned;
    return cleaned.slice(0, maxLen).trimEnd() + "…";
}

export default function ProductsListClient() {
    const t = useTranslations("products");
    const tCommon = useTranslations("common");
    const locale = useLocale();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [view, setView] = useState<"grid" | "slider">("grid");
    const [sliderIdx, setSliderIdx] = useState(0);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [activeImages, setActiveImages] = useState<Record<number, number>>({});
    const lastLoadedProducts = useRef<any[]>([]);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadProducts(); }, [locale]);

    const loadProducts = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await productsApi.list(locale);
            const data = response.results || response;
            setProducts(data);
            lastLoadedProducts.current = data;
            if (data.length > 0) { gaViewItemList(data); fbPageview(); }
        } catch {
            if (lastLoadedProducts.current.length > 0) {
                setProducts(lastLoadedProducts.current);
            } else {
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Cards visible at once (1.8 on desktop) — the 0.8 of the next card peeks
    const CARDS_VISIBLE = 1.8;

    const sliderPrev = useCallback(
        () => setSliderIdx(i => Math.max(0, i - 1)),
        []
    );
    const sliderNext = useCallback(
        () => setSliderIdx(i => Math.min(products.length - 1, i + 1)),
        [products.length]
    );

    // Progress: 0 → 1
    const sliderProgress = products.length <= 1
        ? 1
        : sliderIdx / (products.length - 1);

    return (
        <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=Inter:wght@800&display=swap');

                /* ── Catalog header ── */
                .cat-header {
                    padding: 120px 48px 0;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .cat-eyebrow {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10px;
                    font-weight: 500;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: #a8a29e;
                    margin-bottom: 16px;
                }
                .cat-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 300;
                    font-size: clamp(52px, 8vw, 110px);
                    line-height: 0.9;
                    letter-spacing: -0.02em;
                    color: #111;
                    margin-bottom: 32px;
                }
                .cat-divider {
                    border: none;
                    border-top: 1px solid #e8e4df;
                    margin: 0;
                }
                .cat-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 0;
                }
                .cat-count {
                    font-size: 11px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #a8a29e;
                }
                .view-toggle {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .view-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #c4bfba;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                }
                .view-btn.active { color: #111; }
                .view-btn:hover { color: #111; }

                /* ── GRID VIEW ── */
                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1px;
                    background: #e8e4df;
                }
                @media (max-width: 1024px) { .grid-container { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 640px) { .grid-container { grid-template-columns: 1fr; } }

                .grid-item {
                    background: #fff;
                    display: block;
                    text-decoration: none;
                    cursor: pointer;
                    overflow: hidden;
                    position: relative;
                }
                .grid-img-wrap {
                    overflow: hidden;
                    aspect-ratio: 3/4;
                    background: #f5f2ef;
                    position: relative;
                }
                .grid-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    display: block;
                    position: absolute;
                    inset: 0;
                }
                .grid-item:hover .grid-img { transform: scale(1.06); }
                .grid-img-placeholder {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    background: #f5f2ef;
                }
                .grid-info {
                    padding: 20px 24px 24px;
                }
                .grid-category {
                    font-size: 10px;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: #a8a29e;
                    margin-bottom: 6px;
                }
                .grid-name {
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 400;
                    font-size: 20px;
                    color: #111;
                    line-height: 1.2;
                    margin-bottom: 6px;
                    transition: opacity 0.2s;
                }
                .grid-item:hover .grid-name { opacity: 0.65; }
                .grid-excerpt {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px;
                    font-weight: 300;
                    color: #a8a29e;
                    line-height: 1.55;
                    margin-bottom: 10px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .grid-price {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    color: #555;
                    letter-spacing: 0.02em;
                }

                /* Hover overlay */
                .grid-overlay {
                    position: absolute;
                    inset: 0;
                    padding: 20px;
                    background: transparent; /* No dark background */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    transition: opacity 0.35s ease;
                    pointer-events: none;
                }
                .grid-item:hover .grid-overlay { opacity: 0; }
                .grid-item:hover .grid-overlay-bottom { opacity: 1; }
                
                .grid-overlay-bottom {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    padding: 24px;
                    background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.35s ease;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                }
                .grid-overlay-cta {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #fff;
                }

                /* ── SLIDER VIEW ── */
                .slider-outer {
                    position: relative;
                    padding-top: 48px;
                }

                /* Side arrow buttons */
                .slider-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                    width: 48px;
                    height: 48px;
                    background: #fff;
                    border: 1px solid #e8e4df;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.22s, border-color 0.22s, box-shadow 0.22s;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                }
                .slider-arrow:hover:not(:disabled) {
                    background: #111;
                    border-color: #111;
                    color: #fff;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
                }
                .slider-arrow:disabled {
                    opacity: 0.22;
                    cursor: not-allowed;
                }
                .slider-arrow-left  { left: 8px; }
                .slider-arrow-right { right: 8px; }

                .slider-container {
                    position: relative;
                    overflow: hidden;
                    /* side padding reveals peeking card + space for arrows */
                    padding: 0 72px;
                    --item-width: clamp(280px, calc((100vw - 144px) / 2.8), 350px);
                }
                @media (max-width: 768px) {
                    .slider-container { 
                        padding: 0 48px; 
                        --item-width: clamp(240px, calc(100vw - 96px), 320px);
                    }
                    .slider-arrow-left  { left: 4px; }
                    .slider-arrow-right { right: 4px; }
                }

                .slider-track {
                    display: flex;
                    transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform;
                }

                .slider-item {
                    flex-shrink: 0;
                    width: var(--item-width);
                    padding-right: 16px;
                    box-sizing: border-box;
                    cursor: pointer;
                    text-decoration: none;
                    display: block;
                    transition: opacity 0.35s;
                }
                @media (max-width: 768px) {
                    .slider-item { width: var(--item-width); padding-right: 12px; }
                }

                .slider-img-wrap {
                    /* Big portrait 2:3 */
                    aspect-ratio: 2/3;
                    overflow: hidden;
                    background: #f5f2ef;
                    position: relative;
                }
                .slider-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    transition: transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    display: block;
                    position: absolute;
                    inset: 0;
                }
                .slider-item:hover .slider-img { transform: scale(1.04); }

                .slider-info {
                    padding: 18px 4px 0;
                }
                .slider-category {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10px;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: #a8a29e;
                    margin-bottom: 6px;
                }
                .slider-name {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 24px;
                    font-weight: 400;
                    color: #111;
                    letter-spacing: -0.01em;
                    line-height: 1.15;
                    margin-bottom: 8px;
                    transition: opacity 0.2s;
                }
                .slider-item:hover .slider-name { opacity: 0.65; }
                .slider-excerpt {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 300;
                    color: #a8a29e;
                    line-height: 1.55;
                    margin-bottom: 10px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .slider-price {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    color: #555;
                    letter-spacing: 0.02em;
                }

                /* Progress bar */
                .slider-progress-wrap {
                    margin: 28px 72px 0;
                    height: 2px;
                    background: #e8e4df;
                    border-radius: 1px;
                    overflow: hidden;
                }
                @media (max-width: 768px) { .slider-progress-wrap { margin: 20px 48px 0; } }
                .slider-progress-fill {
                    height: 100%;
                    background: #111;
                    border-radius: 1px;
                    transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* animations */
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .anim-in { animation: fadeUp 0.5s ease forwards; }

                /* Loading */
                .loader-wrap { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .loader-ring {
                    width: 32px; height: 32px;
                    border: 1px solid #e8e4df;
                    border-top-color: #111;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
            `}</style>

            {/* ── HEADER ── */}
            <div className="cat-header">
                <p className="cat-eyebrow">Artesena — {new Date().getFullYear()}</p>
                <h1 className="cat-title">
                    {t("title")}
                </h1>
                <hr className="cat-divider" />
                <div className="cat-toolbar">
                    <span className="cat-count">
                        {loading ? "..." : `${products.length} ${t("title").toLowerCase()}`}
                    </span>
                    <div className="view-toggle" title="Cambiar vista">
                        {/* Grid icon */}
                        <button
                            className={`view-btn ${view === "grid" ? "active" : ""}`}
                            onClick={() => setView("grid")}
                            aria-label="Vista cuadrícula"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="0" y="0" width="7" height="7"/>
                                <rect x="9" y="0" width="7" height="7"/>
                                <rect x="0" y="9" width="7" height="7"/>
                                <rect x="9" y="9" width="7" height="7"/>
                            </svg>
                        </button>
                        {/* Slider icon */}
                        <button
                            className={`view-btn ${view === "slider" ? "active" : ""}`}
                            onClick={() => { setView("slider"); setSliderIdx(0); }}
                            aria-label="Vista slider"
                        >
                            <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
                                <rect x="0" y="0" width="11" height="14" rx="0"/>
                                <rect x="13" y="0" width="5" height="14" rx="0" opacity="0.35"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <hr className="cat-divider" />
            </div>

            {/* ── BODY ── */}
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 0 80px" }}>
                {/* Loading */}
                {loading && (
                    <div className="loader-wrap">
                        <div className="loader-ring" />
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="loader-wrap" style={{ flexDirection: "column", gap: "20px" }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#a8a29e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            {tCommon("error")}
                        </p>
                        <button
                            onClick={loadProducts}
                            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", padding: "12px 28px", background: "#111", color: "#fff", border: "none", cursor: "pointer" }}
                        >
                            {tCommon("retry")}
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && products.length === 0 && (
                    <div className="loader-wrap" style={{ flexDirection: "column", gap: "12px" }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#a8a29e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Sin productos
                        </p>
                    </div>
                )}

                {/* ══ GRID VIEW ══ */}
                {!loading && !error && products.length > 0 && view === "grid" && (
                    <div style={{ padding: "2px 0 0" }}>
                        <div className="grid-container">
                            {products.map((product, idx) => {
                                const imgSrc = getImg(product.images?.[0]);
                                const img2Src = getImg(product.images?.[1]);
                                const desc = excerpt(product.description || product.short_description, 80);
                                return (
                                    <Link
                                        key={product.id}
                                        href={{ pathname: "/products/[id]" as const, params: { id: String(product.id) } }}
                                        className="grid-item anim-in"
                                        style={{ animationDelay: `${Math.min(idx, 5) * 0.06}s`, animationFillMode: "both" }}
                                        onMouseEnter={() => setHoveredId(product.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <div className="grid-img-wrap">
                                            {imgSrc ? (
                                                <>
                                                    <img
                                                        src={imgSrc}
                                                        alt={product.name}
                                                        className="grid-img"
                                                        loading={idx < 6 ? "eager" : "lazy"}
                                                        style={{ opacity: hoveredId === product.id && img2Src ? 0 : 1, transition: "opacity 0.5s ease, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)" }}
                                                    />
                                                    {img2Src && (
                                                        <img
                                                            src={img2Src}
                                                            alt={product.name}
                                                            className="grid-img"
                                                            loading="lazy"
                                                            style={{ opacity: hoveredId === product.id ? 1 : 0, transition: "opacity 0.5s ease, transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)" }}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <div className="grid-img-placeholder">
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                                                        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            {/* Centered text over the first image */}
                                            <div className="grid-overlay" style={{ opacity: hoveredId === product.id ? 0 : 1, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                                                <h3 style={{ 
                                                    fontFamily: "'Inter', sans-serif", 
                                                    fontSize: "clamp(2.5rem, 4vw, 4rem)", 
                                                    fontWeight: 800, 
                                                    background: "linear-gradient(90deg, #C1121F 0%, #FDF0D5 15%, #E56B6F 30%, #780000 45%, #FDF0D5 60%, #E56B6F 75%, #C1121F 100%)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    color: "transparent",
                                                    lineHeight: 0.9,
                                                    letterSpacing: "-0.04em",
                                                    textTransform: "uppercase",
                                                    textAlign: "left",
                                                    margin: 0,
                                                    padding: "0 24px"
                                                }}>{product.name}</h3>
                                            </div>

                                            <div className="grid-overlay-bottom">
                                                <span className="grid-overlay-cta">{t("viewDetails") || "Ver producto"}</span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="grid-info">
                                            <p className="grid-category">{product.category_name}</p>
                                            <h2 className="grid-name">{product.name}</h2>
                                            {desc && <p className="grid-excerpt">{desc}</p>}
                                            <p className="grid-price">${Number(product.base_price).toFixed(2)}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══ SLIDER VIEW ══ */}
                {!loading && !error && products.length > 0 && view === "slider" && (
                    <div className="slider-outer">

                        {/* Left arrow */}
                        <button
                            className="slider-arrow slider-arrow-left"
                            onClick={sliderPrev}
                            disabled={sliderIdx === 0}
                            aria-label="Anterior"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>

                        {/* Right arrow */}
                        <button
                            className="slider-arrow slider-arrow-right"
                            onClick={sliderNext}
                            disabled={sliderIdx >= products.length - 1}
                            aria-label="Siguiente"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>

                        {/* Track */}
                        <div className="slider-container" ref={sliderRef}>
                            <div
                                className="slider-track"
                                style={{
                                    transform: `translateX(calc(-${sliderIdx} * var(--item-width)))`,
                                }}
                            >
                                {products.map((product, idx) => {
                                    const imgSrc = getImg(product.images?.[0]);
                                    const desc = excerpt(product.description || product.short_description, 80);
                                    return (
                                        <Link
                                            key={product.id}
                                            href={{ pathname: "/products/[id]" as const, params: { id: String(product.id) } }}
                                            className="slider-item anim-in"
                                            style={{
                                                animationDelay: `${Math.min(idx, 4) * 0.07}s`,
                                                animationFillMode: "both",
                                            }}
                                        >
                                            <div className="slider-img-wrap">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc}
                                                        alt={product.name}
                                                        className="slider-img"
                                                        loading={idx < 3 ? "eager" : "lazy"}
                                                    />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f2ef", position: "absolute", inset: 0 }}>
                                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                                                            <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                                        </svg>
                                                    </div>
                                                )}
                                                
                                                {/* Centered text over the first image */}
                                                <div className="grid-overlay" style={{ transition: "opacity 0.35s ease", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                                                    <h3 style={{ 
                                                        fontFamily: "'Inter', sans-serif", 
                                                        fontSize: "clamp(2.5rem, 4vw, 4rem)", 
                                                        fontWeight: 800, 
                                                        background: "linear-gradient(90deg, #C1121F 0%, #FDF0D5 15%, #E56B6F 30%, #780000 45%, #FDF0D5 60%, #E56B6F 75%, #C1121F 100%)",
                                                        WebkitBackgroundClip: "text",
                                                        WebkitTextFillColor: "transparent",
                                                        color: "transparent",
                                                        lineHeight: 0.9,
                                                        letterSpacing: "-0.04em",
                                                        textTransform: "uppercase",
                                                        textAlign: "left",
                                                        margin: 0,
                                                        padding: "0 24px"
                                                    }}>{product.name}</h3>
                                                </div>
                                            </div>
                                            <div className="slider-info">
                                                <p className="slider-category">{product.category_name}</p>
                                                <h2 className="slider-name">{product.name}</h2>
                                                {desc && <p className="slider-excerpt">{desc}</p>}
                                                <p className="slider-price">${Number(product.base_price).toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="slider-progress-wrap">
                            <div
                                className="slider-progress-fill"
                                style={{ width: `${sliderProgress * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
