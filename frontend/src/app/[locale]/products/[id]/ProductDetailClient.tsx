"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/navigation";
import { productsApi, cartApi, getSessionId } from "@/services/api";
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
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(infoRef.current?.children || [],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.2 }
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
            
            // Track view item
            if (data) {
                gaViewItem(data);
                fbViewContent(data);
            }
        } catch {
            // On failure, show last loaded content or error state
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
        if (missing?.length > 0) { alert(t("selectAllOptions")); return; }
        setAdding(true);
        try {
            const sessionId = getSessionId();
            const options = Object.entries(selectedOptions).map(([optionId, value]: any) => ({
                option_id: Number(optionId), value_id: value.id,
            }));
            await cartApi.addItem({ session_id: sessionId, product_id: product.id, quantity, options });
            
            // Track add to cart
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
                .ldwrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fafaf8}
                .ld{width:40px;height:40px;border:2px solid #e7e3dc;border-top-color:#d97706;border-radius:50%;animation:sp .8s linear infinite}
                @keyframes sp{to{transform:rotate(360deg)}}
            `}</style>
            <div className="ldwrap"><div className="ld" /></div>
        </>
    );

    if (error && !product) return (
        <>
            <style>{`body{background:#fafaf8;font-family:system-ui}
            .err-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
            .err-wrap h2{font-size:20px;color:#292524}
            .err-btn{background:#d97706;border:none;color:white;cursor:pointer;font-size:14px;padding:10px 20px;border-radius:8px;margin-top:8px}
            .err-btn:hover{background:#b45309}
            .back-btn{background:none;border:none;color:#d97706;cursor:pointer;font-size:14px;text-decoration:underline}`}</style>
            <div className="err-wrap">
                <h2>{t("errorLoading")}</h2>
                <button className="err-btn" onClick={loadProduct}>{t("retryLoad")}</button>
                <button className="back-btn" onClick={() => router.push("/products")}>{t("backToProducts")}</button>
            </div>
        </>
    );

    if (!product) return (
        <>
            <style>{`body{background:#fafaf8;font-family:system-ui}
            .nf{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
            .nf h2{font-size:20px;color:#292524}
            .nfbtn{background:none;border:none;color:#d97706;cursor:pointer;font-size:14px;text-decoration:underline}`}</style>
            <div className="nf">
                <h2>{t("notFound")}</h2>
                <button className="nfbtn" onClick={() => router.push("/products")}>{t("backToProducts")}</button>
            </div>
        </>
    );

    const total = calculateTotal();
    const canGoUp = activeImage > 0;
    const canGoDown = activeImage < images.length - 1;

    return (
        <>
            <style>{CSS}</style>

            <div className={`toast ${showSuccess ? "toast--on" : ""}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                {t("addedToCart")}
            </div>

            <main className="pdp">
                <div className="pdp__inner">

                    {/* ── LEFT: Vertical Slider ── */}
                    <div className="gallery" ref={galleryRef}>
                        <button
                            className={`gallery__arrow gallery__arrow--up ${!canGoUp ? "gallery__arrow--gone" : ""}`}
                            onClick={goUp} aria-label="Previous"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                        </button>

                        <div
                            className="gallery__viewport"
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div
                                className="gallery__track-inner"
                                style={{ transform: `translateY(calc(-${activeImage} * (100% + 12px)))` }}
                            >
                                {images.length > 0 ? images.map((img: any, i: number) => (
                                    <div key={i} className="gallery__slide">
                                        <img
                                            src={img.image.startsWith("http") ? img.image : `http://127.0.0.1:8000${img.image}`}
                                            alt={`${product.name} ${i + 1}`}
                                            loading={i === 0 ? "eager" : "lazy"}
                                            className="gallery__img"
                                            draggable={false}
                                        />
                                    </div>
                                )) : (
                                    <div className="gallery__slide gallery__empty">
                                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <path d="M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zM9 10l12-3"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            className={`gallery__arrow gallery__arrow--down ${!canGoDown ? "gallery__arrow--gone" : ""}`}
                            onClick={goDown} aria-label="Next"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                        </button>

                        {/* Vertical pip track */}
                        {images.length > 1 && (
                            <div className="gallery__pips">
                                {images.map((_: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`gallery__pip ${activeImage === i ? "gallery__pip--on" : ""}`}
                                        aria-label={`Image ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Counter */}
                        {images.length > 1 && (
                            <div className="gallery__count">
                                <span className="gallery__count-n">{activeImage + 1}</span>
                                <span className="gallery__count-slash">/</span>
                                <span className="gallery__count-t">{images.length}</span>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Info ── */}
                    <div className="info" ref={infoRef}>
                        <button className="back" onClick={() => router.push("/products")}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                            {t("backToProducts")}
                        </button>

                        <span className="cat-pill">{product.category_name}</span>

                        <h1 className="name">{product.name}</h1>

                        <div className="price-block">
                            <span className="price">${total.toFixed(2)}</span>
                        </div>

                        <p className="desc">{product.description}</p>

                        <hr className="rule" />

                        {product.product_options?.length > 0 && (
                            <div className="opts">
                                {product.product_options.map((po: any) => {
                                    const opt = po.option;
                                    return (
                                        <div key={opt.id} className="opt-group">
                                            <p className="opt-label">{opt.name}</p>
                                            <div className="opt-chips">
                                                {opt.values.map((val: any) => {
                                                    const sel = selectedOptions[opt.id]?.id === val.id;
                                                    return (
                                                        <button
                                                            key={val.id}
                                                            onClick={() => setSelectedOptions((p: any) => ({
                                                                ...p, [opt.id]: sel ? null : val,
                                                            }))}
                                                            className={`chip ${sel ? "chip--sel" : ""}`}
                                                        >
                                                            {val.name}
                                                            {Number(val.base_extra_price) > 0 && (
                                                                <span className="chip-extra">+${val.base_extra_price}</span>
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

                        <div className="qty-group">
                            <p className="opt-label">{t("quantity")}</p>
                            <div className="qty">
                                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
                                </button>
                                <span className="qty-n">{quantity}</span>
                                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                </button>
                            </div>
                        </div>

                        <button className={`cta ${adding ? "cta--busy" : ""}`} onClick={handleAddToCart} disabled={adding}>
                            {adding ? (
                                <><div className="spin" /> {t("adding")}</>
                            ) : (
                                <>
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                                    {t("addToCart")}
                                </>
                            )}
                        </button>

                        <div className="trust">
                            {[
                                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: t("securePay") },
                                { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: t("fastShipping") },
                                { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: t("returns") },
                            ].map(({ icon, label }) => (
                                <div key={label} className="trust-item">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={icon}/></svg>
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


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pdp {
    min-height: 100vh;
    background: linear-gradient(135deg, #fffbf5 0%, #ffffff 50%, #faf8f5 100%);
    font-family: 'Inter', system-ui, sans-serif;
}

.pdp__inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 120px 32px 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: start;
}
@media (max-width: 860px) {
    .pdp__inner { grid-template-columns: 1fr; padding: 100px 20px 40px; gap: 40px; }
}

/* ── Gallery ── */
.gallery {
    position: sticky;
    top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    position: relative;
}
@media (max-width: 860px) {
    .gallery { position: relative; top: 0; }
}

.gallery__arrow {
    flex-shrink: 0;
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 1px solid #e7e3dc;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #78716c;
    transition: all 0.2s ease;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
}
.gallery__arrow:hover { 
    border-color: #d97706; 
    color: #d97706; 
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15), 0 2px 4px rgba(0,0,0,0.08);
}
.gallery__arrow--gone { opacity: 0; pointer-events: none; }

.gallery__viewport {
    width: 100%;
    height: 600px;
    overflow: hidden;
    border-radius: 24px;
    box-shadow: 
        0 20px 60px rgba(0,0,0,0.08),
        0 8px 24px rgba(0,0,0,0.06),
        0 0 0 1px rgba(0,0,0,0.04);
}
@media (max-width: 860px) {
    .gallery__viewport { height: 400px; }
}

.gallery__track-inner {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.77, 0, 0.18, 1);
    will-change: transform;
}

.gallery__slide {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(135deg, #f5f0e8 0%, #faf8f3 100%);
}

.gallery__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d6cfc4;
}

.gallery__img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
}

/* Vertical pip track */
.gallery__pips {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
    padding: 12px 8px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.gallery__pip {
    width: 6px; height: 6px;
    border-radius: 50%;
    border: none; padding: 0;
    background: #d6cfc4;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.gallery__pip:hover { background: #d97706; transform: scale(1.3); }
.gallery__pip--on {
    height: 28px;
    border-radius: 4px;
    background: #d97706;
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

/* Counter badge */
.gallery__count {
    position: absolute;
    bottom: 20px;
    left: 20px;
    display: flex; align-items: baseline; gap: 4px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(8px);
    border: 1px solid #e7e3dc;
    border-radius: 24px;
    padding: 6px 14px;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.gallery__count-n { font-size: 14px; font-weight: 600; color: #d97706; }
.gallery__count-slash { font-size: 12px; color: #c4b9b0; }
.gallery__count-t { font-size: 12px; color: #a8a29e; }

/* ── Info ── */
.info {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.back {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase;
    color: #a8a29e; padding: 0;
    transition: all 0.2s;
    font-weight: 500;
}
.back:hover { color: #d97706; }
.back svg { transition: transform 0.2s; }
.back:hover svg { transform: translateX(-4px); }

.cat-pill {
    display: inline-block;
    font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: #d97706; background: #fef3c7;
    padding: 6px 14px; border-radius: 24px;
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.12);
    width: fit-content;
}

.name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 500;
    line-height: 1.2;
    color: #1c1917;
    letter-spacing: -0.02em;
    text-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.price-block { 
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    padding: 20px 24px;
    border-radius: 16px;
    border: 1px solid #fde68a;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
}
.price {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 44px; font-weight: 600;
    color: #92400e;
    letter-spacing: -0.02em;
    line-height: 1;
}

.desc {
    font-size: 15px; line-height: 1.8;
    color: #57534e; font-weight: 400;
}

.rule {
    border: none; border-top: 1px solid #f0ebe3;
}

.opts { display: flex; flex-direction: column; gap: 24px; }

.opt-group {
    background: white;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #f0ebe3;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.opt-label {
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #78716c; font-weight: 600; margin-bottom: 12px;
}

.opt-chips { display: flex; flex-wrap: wrap; gap: 10px; }

.chip {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 20px;
    border-radius: 12px;
    border: 2px solid #e7e3dc;
    background: white;
    color: #44403c;
    font-family: 'Inter', sans-serif;
    font-size: 14px; cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.chip:hover { 
    border-color: #d97706; 
    color: #92400e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.12);
}
.chip--sel { 
    border-color: #d97706; 
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); 
    color: #92400e; 
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15);
}
.chip-extra { font-size: 12px; color: #a8a29e; font-weight: 500; }

.qty-group { }
.qty {
    display: inline-flex; align-items: center;
    border: 2px solid #e7e3dc; border-radius: 12px;
    overflow: hidden; background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.qty-btn {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    color: #78716c; transition: all 0.2s;
}
.qty-btn:hover:not(:disabled) { background: #fef3c7; color: #d97706; }
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-n {
    min-width: 50px; text-align: center;
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 600; color: #1c1917;
    border-left: 1px solid #f0ebe3;
    border-right: 1px solid #f0ebe3;
    line-height: 44px;
}

.cta {
    width: 100%; padding: 18px 32px;
    border-radius: 14px; border: none;
    background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 600; letter-spacing: 0.02em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1);
}
.cta:hover:not(:disabled) { 
    background: linear-gradient(135deg, #292524 0%, #44403c 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.12);
}
.cta:active:not(:disabled) { transform: translateY(0); }
.cta:disabled { opacity: 0.6; cursor: not-allowed; }
.spin {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: sp .7s linear infinite;
}
@keyframes sp { to { transform: rotate(360deg); } }

.trust { 
    display: flex; 
    gap: 24px; 
    flex-wrap: wrap;
    padding: 20px;
    background: #fafaf9;
    border-radius: 12px;
    border: 1px solid #f0ebe3;
}
.trust-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 12px; color: #78716c;
    font-weight: 500;
}
.trust-item svg { color: #d97706; }

.toast {
    position: fixed; top: 100px; right: 24px; z-index: 9999;
    background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
    color: white;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px; border-radius: 12px;
    transform: translateX(400px); opacity: 0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
    box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.12);
}
.toast--on { transform: translateX(0); opacity: 1; }
.toast svg { color: #10b981; }`;
