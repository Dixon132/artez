"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { productsApi, cartApi, getSessionId } from "@/services/api";
import gsap from "gsap";
import { gaViewItem, gaAddToCart } from "@/lib/analytics";
import { fbViewContent, fbAddToCart } from "@/lib/fbpixel";
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
function getImg(img: any) {
    if (!img) return null;
    const url = img.image || img;
    if (!url) return null;
    return url.startsWith("http") ? url : `${BACKEND}${url}`;
}

export default function ProductDetailClient() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("products");
    const locale = useLocale();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [adding, setAdding] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<any>({});
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const touchStartY = useRef(0);
    const infoRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const lastLoadedProduct = useRef<any>(null);

    useEffect(() => { loadProduct(); }, [params.id, locale]);

    useEffect(() => {
        if (!loading && product) {
            gsap.fromTo(galleryRef.current,
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }
            );
            gsap.fromTo(infoRef.current?.children || [],
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power2.out", delay: 0.15 }
            );
        }
    }, [loading, product]);

    const loadProduct = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await productsApi.get(Number(params.id), locale);
            setProduct(data);
            lastLoadedProduct.current = data;
            if (data) { gaViewItem(data); fbViewContent(data); }
        } catch {
            if (lastLoadedProduct.current) {
                setProduct(lastLoadedProduct.current);
            } else {
                setError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!product) return 0;
        let total = Number(product.base_price);
        Object.values(selectedOptions).forEach((val: any) => {
            if (val) total += Number(val.base_extra_price);
        });
        return total * quantity;
    };

    const handleAddToCart = async () => {
        const missing = product.product_options?.filter((po: any) => !selectedOptions[po.option.id]);
        if (missing?.length > 0) { toast.error(t("selectAllOptions")); return; }
        setAdding(true);
        try {
            const sessionId = getSessionId();
            const options = Object.entries(selectedOptions).map(([optionId, value]: any) => ({
                option_id: Number(optionId), value_id: value.id,
            }));
            await cartApi.addItem({ session_id: sessionId, product_id: product.id, quantity, options });
            const total = calculateTotal();
            gaAddToCart(product, quantity, total);
            fbAddToCart(product, quantity, total);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } finally { setAdding(false); }
    };

    const images = product?.images || [];
    const goUp = () => setActiveImage(i => Math.max(0, i - 1));
    const goDown = () => setActiveImage(i => Math.min(images.length - 1, i + 1));

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY > 0) goDown(); else goUp();
    };
    const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (diff > 40) goDown();
        if (diff < -40) goUp();
    };

    if (loading) return (
        <>
            <style>{`
                @keyframes sp{to{transform:rotate(360deg)}}
                .ldwrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff}
                .ld{width:28px;height:28px;border:1px solid #e8e4df;border-top-color:#111;border-radius:50%;animation:sp .8s linear infinite}
            `}</style>
            <div className="ldwrap"><div className="ld" /></div>
        </>
    );

    if (error && !product) return (
        <>
            <style>{`body{background:#fff;font-family:'DM Sans',sans-serif}
            .err{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
            .err p{font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#a8a29e}
            .err-btn{font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:14px 32px;background:#111;color:#fff;border:none;cursor:pointer}`}</style>
            <div className="err">
                <p>{t("errorLoading")}</p>
                <button className="err-btn" onClick={loadProduct}>{t("retryLoad")}</button>
                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", fontFamily: "'DM Sans', sans-serif" }} onClick={() => router.push("/products")}>{t("backToProducts")}</button>
            </div>
        </>
    );

    if (!product) return null;

    const total = calculateTotal();
    const canGoUp = activeImage > 0;
    const canGoDown = activeImage < images.length - 1;

    return (
        <>
            <style>{CSS_PDP}</style>

            {/* Added to cart notification */}
            <div className={`pdp-toast ${showSuccess ? "pdp-toast--on" : ""}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {t("addedToCart")}
            </div>

            <main className="pdp">
                <div className="pdp-inner">

                    {/* ── LEFT: Gallery ── */}
                    <div className="pdp-gallery" ref={galleryRef}>
                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="pdp-thumbs">
                                {images.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        className={`pdp-thumb ${activeImage === i ? "pdp-thumb--on" : ""}`}
                                        onClick={() => setActiveImage(i)}
                                        aria-label={`Imagen ${i + 1}`}
                                    >
                                        <img
                                            src={getImg(img) || ""}
                                            alt=""
                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main image */}
                        <div
                            className="pdp-main-img-wrap"
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {images.length > 0 ? (
                                images.map((img: any, i: number) => (
                                    <img
                                        key={i}
                                        src={getImg(img) || ""}
                                        alt={`${product.name} ${i + 1}`}
                                        loading={i === 0 ? "eager" : "lazy"}
                                        className="pdp-main-img"
                                        style={{ opacity: activeImage === i ? 1 : 0, zIndex: activeImage === i ? 1 : 0 }}
                                        draggable={false}
                                    />
                                ))
                            ) : (
                                <div className="pdp-img-empty">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1">
                                        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                                    </svg>
                                </div>
                            )}

                            {/* Nav arrows over image */}
                            {images.length > 1 && (
                                <div className="pdp-img-nav">
                                    <button className="pdp-img-arrow" onClick={goUp} disabled={!canGoUp} aria-label="Anterior">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 15l-6-6-6 6"/></svg>
                                    </button>
                                    <span className="pdp-img-counter">{activeImage + 1} / {images.length}</span>
                                    <button className="pdp-img-arrow" onClick={goDown} disabled={!canGoDown} aria-label="Siguiente">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6"/></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Info ── */}
                    <div className="pdp-info" ref={infoRef}>
                        {/* Back */}
                        <button className="pdp-back" onClick={() => router.push("/products")}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                            {t("backToProducts")}
                        </button>

                        {/* Category */}
                        <p className="pdp-category">{product.category_name}</p>

                        {/* Name */}
                        <h1 className="pdp-name">{product.name}</h1>

                        {/* Price */}
                        <p className="pdp-price">${total.toFixed(2)}</p>

                        {/* Divider */}
                        <div className="pdp-rule" />

                        {/* Description */}
                        <p className="pdp-desc">{product.description}</p>

                        {/* Options */}
                        {product.product_options?.length > 0 && (
                            <div className="pdp-opts">
                                {product.product_options.map((po: any) => {
                                    const opt = po.option;
                                    return (
                                        <div key={opt.id} className="pdp-opt-group">
                                            <p className="pdp-opt-label">
                                                {opt.name}
                                                {selectedOptions[opt.id] && (
                                                    <span className="pdp-opt-sel"> — {selectedOptions[opt.id].name}</span>
                                                )}
                                            </p>
                                            <div className="pdp-chips">
                                                {opt.values.map((val: any) => {
                                                    const sel = selectedOptions[opt.id]?.id === val.id;
                                                    return (
                                                        <button
                                                            key={val.id}
                                                            onClick={() => setSelectedOptions((p: any) => ({
                                                                ...p, [opt.id]: sel ? null : val,
                                                            }))}
                                                            className={`pdp-chip ${sel ? "pdp-chip--sel" : ""}`}
                                                        >
                                                            {val.image && (
                                                                <img
                                                                    src={getImg(val) || ""}
                                                                    alt={val.name}
                                                                    className="pdp-chip-img"
                                                                />
                                                            )}
                                                            {val.name}
                                                            {Number(val.base_extra_price) > 0 && (
                                                                <span className="pdp-chip-extra">+${val.base_extra_price}</span>
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
                        <div className="pdp-qty-group">
                            <p className="pdp-opt-label">{t("quantity")}</p>
                            <div className="pdp-qty">
                                <button className="pdp-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                    <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2"/></svg>
                                </button>
                                <span className="pdp-qty-n">{quantity}</span>
                                <button className="pdp-qty-btn" onClick={() => setQuantity(quantity + 1)}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="5" y="0" width="2" height="12"/><rect x="0" y="5" width="12" height="2"/></svg>
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <button className={`pdp-cta ${adding ? "pdp-cta--busy" : ""}`} onClick={handleAddToCart} disabled={adding}>
                            {adding ? (
                                <><div className="pdp-spin" /> {t("adding")}</>
                            ) : t("addToCart")}
                        </button>

                        {/* Trust */}
                        <div className="pdp-trust">
                            {[
                                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: t("securePay") },
                                { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: t("fastShipping") },
                                { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: t("returns") },
                            ].map(({ icon, label }) => (
                                <div key={label} className="pdp-trust-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={icon}/></svg>
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

const CSS_PDP = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pdp {
    min-height: 100vh;
    background: #fff;
    font-family: 'DM Sans', system-ui, sans-serif;
}
.pdp-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding-top: 64px;
    display: grid;
    grid-template-columns: 1fr 480px;
    min-height: 100vh;
    align-items: start;
}
@media (max-width: 1100px) {
    .pdp-inner { grid-template-columns: 1fr; }
}

/* ── Gallery ── */
.pdp-gallery {
    display: flex;
    gap: 12px;
    padding: 0;
    position: sticky;
    top: 64px;
    align-self: start;
}
@media (max-width: 1100px) {
    .pdp-gallery { position: relative; top: 0; }
}

.pdp-thumbs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 64px;
    flex-shrink: 0;
    padding: 16px 0 16px 24px;
}
.pdp-thumb {
    width: 64px;
    height: 80px;
    border: none;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    background: #f5f2ef;
    opacity: 0.5;
    transition: opacity 0.2s;
    flex-shrink: 0;
}
.pdp-thumb:hover { opacity: 0.8; }
.pdp-thumb--on { opacity: 1; outline: 1px solid #111; }

.pdp-main-img-wrap {
    position: relative;
    flex: 1;
    background: #f5f2ef;
    overflow: hidden;
    min-height: calc(100vh - 64px);
}
@media (max-width: 1100px) {
    .pdp-main-img-wrap { min-height: 70vw; max-height: 80vh; }
}

.pdp-main-img {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    transition: opacity 0.4s ease;
}
.pdp-img-empty {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    min-height: 500px;
}

/* Image nav overlay */
.pdp-img-nav {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
    padding: 8px 16px;
}
.pdp-img-arrow {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #111;
    display: flex;
    transition: opacity 0.2s;
}
.pdp-img-arrow:disabled { opacity: 0.25; cursor: not-allowed; }
.pdp-img-counter {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #555;
    min-width: 40px;
    text-align: center;
}

/* ── Info ── */
.pdp-info {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 64px 48px 64px 40px;
    border-left: 1px solid #e8e4df;
    min-height: calc(100vh - 64px);
}
@media (max-width: 1100px) {
    .pdp-info { border-left: none; border-top: 1px solid #e8e4df; padding: 32px 24px; }
}

.pdp-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #a8a29e;
    padding: 0;
    transition: color 0.2s;
    margin-bottom: 4px;
}
.pdp-back:hover { color: #111; }

.pdp-category {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #a8a29e;
}

.pdp-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 400;
    font-size: clamp(28px, 3.5vw, 42px);
    line-height: 1.15;
    color: #111;
    letter-spacing: -0.01em;
}

.pdp-price {
    font-family: 'DM Sans', sans-serif;
    font-size: 18px;
    font-weight: 400;
    color: #555;
    letter-spacing: 0.02em;
}

.pdp-rule {
    border-top: 1px solid #e8e4df;
}

.pdp-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    line-height: 1.9;
    color: #777;
    font-weight: 300;
}

/* Options */
.pdp-opts { display: flex; flex-direction: column; gap: 20px; }
.pdp-opt-group { display: flex; flex-direction: column; gap: 10px; }
.pdp-opt-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #aaa;
}
.pdp-opt-sel {
    text-transform: none;
    letter-spacing: 0;
    color: #111;
    font-weight: 500;
}
.pdp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.pdp-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border: 1px solid #e8e4df;
    background: #fff;
    color: #333;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
}
.pdp-chip:hover { border-color: #111; }
.pdp-chip--sel { border-color: #111; background: #111; color: #fff; }
.pdp-chip-extra { font-size: 11px; opacity: 0.6; }
.pdp-chip-img { width: 24px; height: 24px; object-fit: cover; }

/* Quantity */
.pdp-qty-group { display: flex; flex-direction: column; gap: 10px; }
.pdp-qty { display: inline-flex; align-items: center; border: 1px solid #e8e4df; }
.pdp-qty-btn {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    color: #333;
    transition: background 0.15s;
}
.pdp-qty-btn:hover:not(:disabled) { background: #f5f2ef; }
.pdp-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.pdp-qty-n {
    min-width: 48px;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #111;
    border-left: 1px solid #e8e4df;
    border-right: 1px solid #e8e4df;
    line-height: 40px;
}

/* CTA */
.pdp-cta {
    width: 100%;
    padding: 16px;
    background: #111;
    color: #fff;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s;
}
.pdp-cta:hover:not(:disabled) { background: #333; }
.pdp-cta:disabled { opacity: 0.55; cursor: not-allowed; }
.pdp-spin {
    width: 14px; height: 14px;
    border: 1.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: pdp-sp .7s linear infinite;
}
@keyframes pdp-sp { to { transform: rotate(360deg); } }

/* Trust */
.pdp-trust {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
}
.pdp-trust-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: #a8a29e;
    letter-spacing: 0.04em;
}

/* Toast */
.pdp-toast {
    position: fixed; top: 80px; right: 24px; z-index: 9999;
    background: #111;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px;
    transform: translateX(300px); opacity: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
}
.pdp-toast--on { transform: translateX(0); opacity: 1; }
`;
