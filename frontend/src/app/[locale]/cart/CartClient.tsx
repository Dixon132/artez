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
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdfcfa" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "2px solid #e8e4df",
                    borderTopColor: "#C4612E",
                    animation: "spin 0.8s linear infinite"
                }} />
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
        <main style={{ minHeight: "100vh", background: "#fdfcfa", fontFamily: "'DM Sans', sans-serif", paddingBottom: 80 }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .cart-item-row {
                    background: #fff;
                    border-bottom: 1px solid #f0ece6;
                    display: flex;
                    gap: 28px;
                    padding: 28px 0;
                    align-items: flex-start;
                    animation: fadeUp 0.4s ease both;
                    transition: background 0.2s;
                }
                .cart-item-row:hover { background: #fdfaf7; }
                .cart-item-row:first-child { border-top: 1px solid #f0ece6; }

                .qty-btn {
                    width: 32px; height: 32px;
                    border: 1px solid #d9d2c8;
                    background: #fff;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #444;
                    transition: all 0.15s;
                }
                .qty-btn:hover:not(:disabled) { border-color: #C4612E; color: #C4612E; background: #fef6f1; }
                .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                .remove-btn {
                    background: none; border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
                    color: #aaa; padding: 4px 0;
                    transition: color 0.15s;
                    display: flex; align-items: center; gap: 4px;
                }
                .remove-btn:hover { color: #C4612E; }

                .checkout-btn {
                    width: 100%;
                    padding: 16px 24px;
                    background: #111;
                    color: #fff;
                    border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px; font-weight: 600;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    transition: background 0.2s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }
                .checkout-btn:hover { background: #C4612E; }

                .option-chip {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 10px; font-family: 'DM Sans', sans-serif;
                    color: #777; border: 1px solid #e8e4de;
                    padding: 2px 8px; background: #faf8f5;
                }

                .summary-panel {
                    background: #fff;
                    border: 1px solid #e8e4de;
                    position: sticky; top: 24px;
                }

                .explore-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 14px 32px;
                    background: #111; color: #fff; border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
                    transition: background 0.2s;
                }
                .explore-btn:hover { background: #C4612E; }
            `}</style>

            {/* ── Editorial Full-Width Header ── */}
            <header style={{ position: "relative", width: "100%", overflow: "hidden", minHeight: "30vh", display: "flex", alignItems: "center" }}>
                {/* Background Image */}
                <Image src="/img/charango.png" alt="Cart Background" fill style={{ objectFit: "cover" }} />
                {/* Dark Overlay Filter */}
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(17, 17, 17, 0.75)" }} />

                <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "40px", position: "relative", zIndex: 1 }}>
                    {/* Eyebrow label */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        marginBottom: 16
                    }}>
                        <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.4)" }} />
                        <span style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 10, fontWeight: 600,
                            letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.8)"
                        }}>
                            Artesena · {tNav("cart")}
                        </span>
                    </div>

                    {/* Title row */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 24, flexWrap: "wrap" }}>
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "clamp(3rem, 6vw, 5.5rem)",
                            fontWeight: 300,
                            color: "#fff",
                            margin: 0,
                            lineHeight: 1,
                            letterSpacing: "-0.01em",
                            textShadow: "0 4px 12px rgba(0,0,0,0.3)"
                        }}>
                            {t("title")}
                        </h1>
                        {!isEmpty && (
                            <span style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: 13, fontWeight: 500,
                                color: "rgba(255,255,255,0.9)",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                border: "1px solid rgba(255,255,255,0.3)",
                                padding: "4px 12px",
                                borderRadius: "2px"
                            }}>
                                {totalItems} {itemLabel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom accent stripe */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #C4612E 0%, #2D1B69 60%, #C4612E 100%)" }} />
            </header>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}>
                {isEmpty ? (
                    /* ── Empty State ── */
                    <div style={{
                        maxWidth: 480, margin: "80px auto", textAlign: "center",
                        animation: "fadeIn 0.5s ease"
                    }}>
                        {/* Geometric empty icon */}
                        <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 32px" }}>
                            <div style={{
                                position: "absolute", inset: 0,
                                border: "1px solid #e8e4de",
                                transform: "rotate(12deg)"
                            }} />
                            <div style={{
                                position: "absolute", inset: 8,
                                border: "1px solid #C4612E",
                                opacity: 0.4,
                                transform: "rotate(-4deg)"
                            }} />
                            <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4612E" strokeWidth={1.2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                            </div>
                        </div>

                        <h3 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 28, fontWeight: 400, color: "#111",
                            margin: "0 0 12px"
                        }}>
                            {t("empty")}
                        </h3>
                        <p style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 14, color: "#888", lineHeight: 1.7,
                            margin: "0 0 36px"
                        }}>
                            {t("emptyDescription")}
                        </p>
                        <button
                            onClick={() => router.push("/products")}
                            className="explore-btn"
                        >
                            <span>{t("viewProducts")}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    /* ── Cart Grid ── */
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 40,
                        paddingTop: 48
                    }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1fr) 340px",
                            gap: 60,
                            alignItems: "start"
                        }}
                            className="cart-grid-responsive"
                        >
                            <style>{`
                                @media (max-width: 900px) {
                                    .cart-grid-responsive {
                                        grid-template-columns: 1fr !important;
                                    }
                                }
                            `}</style>

                            {/* ── LEFT: Items List ── */}
                            <div>
                                {/* Column headers */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    paddingBottom: 12,
                                    borderBottom: "2px solid #111",
                                    marginBottom: 0
                                }}>
                                    <span style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: 10, fontWeight: 600,
                                        letterSpacing: "0.2em", textTransform: "uppercase", color: "#aaa"
                                    }}>
                                        Producto
                                    </span>
                                    <span style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: 10, fontWeight: 600,
                                        letterSpacing: "0.2em", textTransform: "uppercase", color: "#aaa"
                                    }}>
                                        Total
                                    </span>
                                </div>

                                {/* Items */}
                                {cart.items.map((item: any, idx: number) => {
                                    const itemTotal = (Number(item.product_price) + item.selected_options.reduce((acc: number, opt: any) => acc + Number(opt.extra_price), 0)) * item.quantity;
                                    return (
                                        <div
                                            key={item.id}
                                            className="cart-item-row"
                                            style={{ animationDelay: `${idx * 0.07}s` }}
                                        >
                                            {/* Product Image */}
                                            <div style={{
                                                position: "relative", width: 100, height: 120,
                                                background: "#f5f3ef",
                                                flexShrink: 0, overflow: "hidden"
                                            }}>
                                                {item.product_image ? (
                                                    <Image
                                                        src={getAbsoluteMediaUrl(item.product_image)}
                                                        alt={item.product_name || "Product image"}
                                                        fill
                                                        sizes="100px"
                                                        loading="lazy"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth={1}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zM9 10l12-3" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {/* Small terracotta accent corner */}
                                                <div style={{
                                                    position: "absolute", bottom: 0, left: 0,
                                                    width: 16, height: 3, background: "#C4612E"
                                                }} />
                                            </div>

                                            {/* Core Info */}
                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 120 }}>
                                                <div>
                                                    <h3 style={{
                                                        fontFamily: "'Cormorant Garamond', serif",
                                                        fontSize: 18, fontWeight: 500, color: "#111",
                                                        margin: "0 0 6px", lineHeight: 1.2
                                                    }}>
                                                        {item.product_name}
                                                    </h3>

                                                    {/* Options chips */}
                                                    {item.selected_options.length > 0 && (
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                                            {item.selected_options.map((opt: any) => (
                                                                <span key={opt.id} className="option-chip">
                                                                    <span style={{ color: "#aaa" }}>{opt.option_name}:</span>{" "}
                                                                    <span style={{ color: "#444", fontWeight: 500 }}>{opt.value_name}</span>
                                                                    {Number(opt.extra_price) > 0 && (
                                                                        <span style={{ color: "#C4612E", fontWeight: 600 }}> +${opt.extra_price}</span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity + Remove */}
                                                <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16 }}>
                                                    {/* Qty control */}
                                                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #d9d2c8" }}>
                                                        <button
                                                            className="qty-btn"
                                                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            disabled={item.quantity <= 1}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                                                        </button>
                                                        <span style={{
                                                            minWidth: 36, textAlign: "center",
                                                            fontFamily: "'DM Sans', sans-serif",
                                                            fontSize: 13, fontWeight: 500,
                                                            color: "#111", lineHeight: "32px",
                                                            borderLeft: "1px solid #d9d2c8",
                                                            borderRight: "1px solid #d9d2c8"
                                                        }}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="qty-btn"
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            aria-label="Increase quantity"
                                                        >
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                                                        </button>
                                                    </div>

                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        aria-label={t("remove")}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                                                        </svg>
                                                        <span>{t("remove")}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price column */}
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", minHeight: 120 }}>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{
                                                        fontFamily: "'Cormorant Garamond', serif",
                                                        fontSize: 22, fontWeight: 500,
                                                        color: "#111"
                                                    }}>
                                                        ${itemTotal.toFixed(2)}
                                                    </div>
                                                    <div style={{
                                                        fontFamily: "'DM Sans', sans-serif",
                                                        fontSize: 11, color: "#aaa", marginTop: 3
                                                    }}>
                                                        ${(Number(item.product_price) + item.selected_options.reduce((acc: number, opt: any) => acc + Number(opt.extra_price), 0)).toFixed(2)} {eachLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── RIGHT: Order Summary Panel ── */}
                            <div className="summary-panel" style={{ overflow: "hidden" }}>
                                {/* Colored geometric header */}
                                <div style={{
                                    background: "#2D1B69",
                                    padding: "24px 28px",
                                    position: "relative",
                                    overflow: "hidden"
                                }}>
                                    {/* Corner accent */}
                                    <div style={{
                                        position: "absolute", top: 0, right: 0,
                                        width: 60, height: "100%",
                                        background: "#C4612E",
                                        clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)"
                                    }} />
                                    <h3 style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: 22, fontWeight: 400, color: "#fff",
                                        margin: 0, position: "relative", zIndex: 1
                                    }}>
                                        {t("summary")}
                                    </h3>
                                </div>

                                {/* Summary body */}
                                <div style={{ padding: "28px 28px 0" }}>
                                    {/* Subtotal row */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "center",
                                        paddingBottom: 16, borderBottom: "1px solid #f0ece6"
                                    }}>
                                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#777" }}>
                                            {t("subtotal")}
                                        </span>
                                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 500, color: "#111" }}>
                                            ${cart.total.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Shipping row */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "16px 0",
                                        borderBottom: "1px solid #f0ece6"
                                    }}>
                                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#777" }}>
                                            {shippingLabel}
                                        </span>
                                        <span style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 10, fontWeight: 700,
                                            letterSpacing: "0.1em", textTransform: "uppercase",
                                            color: "#2D7A4F", background: "#e8f5ee",
                                            padding: "3px 8px"
                                        }}>
                                            {freeLabel}
                                        </span>
                                    </div>

                                    {/* Total */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "baseline",
                                        padding: "20px 0 24px"
                                    }}>
                                        <span style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 11, fontWeight: 700,
                                            letterSpacing: "0.16em", textTransform: "uppercase",
                                            color: "#444"
                                        }}>
                                            {t("total")}
                                        </span>
                                        <span style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: 32, fontWeight: 500, color: "#111"
                                        }}>
                                            ${cart.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => router.push("/checkout")}
                                    className="checkout-btn"
                                >
                                    <span>{t("checkout")}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Security note */}
                                <div style={{
                                    padding: "14px 28px",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    borderTop: "1px solid #f0ece6"
                                }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C4612E" strokeWidth={2}>
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <span style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: 10, fontWeight: 500,
                                        letterSpacing: "0.12em", textTransform: "uppercase",
                                        color: "#aaa"
                                    }}>
                                        {secureLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
