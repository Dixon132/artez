"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { cartApi, ordersApi, getSessionId, shippingZonesApi, couponsApi, countriesApi } from "@/services/api";
import OrderSummary from "@/components/checkout/OrderSummary";
import { gaBeginCheckout } from "@/lib/analytics";
import { fbInitiateCheckout } from "@/lib/fbpixel";
import PaymentModal from "@/components/checkout/PaymentModal";
import toast from 'react-hot-toast';

interface CountryOption {
    id: number;
    name: string;
    code: string;
    shipping_zone: number | null;
    zone_name: string | null;
    zone_id: number | null;
}

interface ShippingZone {
    id: number;
    name: string;
    price: number;
    extra_per_item: number;
    continent: number | null;
}

interface AddressFormData {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export function formatAddress(data: AddressFormData): string {
    return [data.street, data.city, data.state, data.postalCode, data.country]
        .filter(Boolean)
        .join(", ");
}

export default function CheckoutPage() {
    const router = useRouter();
    const t = useTranslations("checkout");
    const locale = useLocale();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        email: "",
        full_name: "",
    });
    const [address, setAddress] = useState<AddressFormData>({
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [allCountries, setAllCountries] = useState<CountryOption[]>([]);
    const [selectedCountryObj, setSelectedCountryObj] = useState<CountryOption | null>(null);
    const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState("");

    useEffect(() => {
        loadCart();
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            const res = await countriesApi.list();
            const countries = (res.results || res) as CountryOption[];
            setAllCountries(countries);
        } catch (e) {
            console.error("Error loading countries", e);
        }
    };

    const handleCountryChange = async (code: string) => {
        handleAddressChange("country", code);
        setSelectedCountryObj(null);
        setSelectedZone(null);

        const country = allCountries.find(c => c.code === code);
        if (!country) return;

        setSelectedCountryObj(country);

        if (!country.shipping_zone) return;

        try {
            const zone = await shippingZonesApi.get(country.shipping_zone);
            setSelectedZone(zone);
        } catch (e) {
            console.error("Error loading zone", e);
        }
    };

    const handleApplyCoupon = async () => {
        setCouponError("");
        if (!couponCode.trim()) return;
        try {
            const res = await couponsApi.validate(couponCode);
            if (res.error) {
                setCouponError(res.error);
                setAppliedCoupon(null);
            } else {
                setAppliedCoupon(res);
            }
        } catch (e) {
            setCouponError("Error al validar cupón");
            setAppliedCoupon(null);
        }
    };

    const subtotal = cart?.items.reduce((acc: number, item: any) => {
        const itemPrice = Number(item.product_price) + item.selected_options.reduce((sum: number, opt: any) => sum + Number(opt.extra_price), 0);
        return acc + itemPrice * item.quantity;
    }, 0) || 0;

    const totalItems = cart?.items.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

    const shippingCost = selectedZone
        ? Number(selectedZone.price) + Math.max(0, totalItems - 1) * Number(selectedZone.extra_per_item)
        : 0;

    let discountApplied = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'fixed') {
            discountApplied = Number(appliedCoupon.discount_value);
        } else {
            discountApplied = (subtotal * Number(appliedCoupon.discount_value)) / 100;
        }
    }

    const loadCart = async () => {
        setLoading(true);
        const sessionId = getSessionId();
        const data = await cartApi.get(sessionId);
        setCart(data);
        setLoading(false);

        if (data && data.items.length > 0) {
            gaBeginCheckout(data);
            fbInitiateCheckout(data);
        }
    };

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: Record<string, string> = {};
        if (!address.street.trim()) errors.street = t("required");
        if (!address.city.trim()) errors.city = t("required");
        if (!address.country.trim()) errors.country = t("required");

        if (!selectedZone) {
            errors.country = selectedCountryObj
                ? "No hay envío disponible para este país"
                : "Selecciona un país con envío disponible";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setShowPaymentModal(true);
    };

    const handlePaymentConfirmed = async () => {
        setShowPaymentModal(false);
        setSubmitting(true);
        try {
            const sessionId = getSessionId();
            const formattedAddress = formatAddress(address);
            const response = await ordersApi.create({
                session_id: sessionId,
                email: form.email,
                full_name: form.full_name,
                address: formattedAddress,
                country_code: selectedCountryObj?.code || null,
                coupon_code: appliedCoupon?.code
            });
            router.push(`/checkout/success?order=${response.order.id}` as any);
        } catch (error) {
            toast.error("Error al crear la orden");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddressChange = (field: keyof AddressFormData, value: string) => {
        setAddress({ ...address, [field]: value });
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdfcfa" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
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

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fdfcfa" }}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
                `}</style>
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#111", marginBottom: 20 }}>
                        {t("title")}
                    </h2>
                    <button
                        onClick={() => router.push("/products")}
                        style={{
                            padding: "14px 32px",
                            background: "#C4612E", color: "#fff",
                            border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12, fontWeight: 600,
                            letterSpacing: "0.12em", textTransform: "uppercase"
                        }}
                    >
                        {t("backToCart")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main style={{ minHeight: "100vh", background: "#fdfcfa", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .co-input {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1px solid #d8d3cb;
                    border-radius: 0;
                    background: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #111;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                    appearance: none;
                }
                .co-input:focus { border-color: #C4612E; }
                .co-input.error { border-color: #dc2626; }
                .co-input::placeholder { color: #aaa; }

                .co-select {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1px solid #d8d3cb;
                    border-radius: 0;
                    background: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #111;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                    appearance: none;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 14px center;
                    padding-right: 36px;
                }
                .co-select:focus { border-color: #C4612E; }
                .co-select.error { border-color: #dc2626; }

                .co-label {
                    display: block;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px; font-weight: 600;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    color: #555;
                    margin-bottom: 8px;
                }

                .co-section {
                    margin-bottom: 36px;
                    animation: fadeUp 0.4s ease both;
                }

                .co-section-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 20px; font-weight: 500;
                    color: #111;
                    margin: 0 0 24px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid #e8e4de;
                    display: flex; align-items: center; gap: 12px;
                }

                .co-section-title::before {
                    content: '';
                    display: block;
                    width: 3px; height: 20px;
                    background: #C4612E;
                    flex-shrink: 0;
                }

                .field-error {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; color: #dc2626;
                    margin-top: 6px;
                }

                .zone-info {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; color: #2D1B69;
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #f0ecfa;
                    border-left: 2px solid #2D1B69;
                }

                .zone-error {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; color: #dc2626;
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #fef2f2;
                    border-left: 2px solid #dc2626;
                }

                .coupon-apply-btn {
                    padding: 12px 20px;
                    background: #111; color: #fff;
                    border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px; font-weight: 600;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    white-space: nowrap;
                    transition: background 0.2s;
                    flex-shrink: 0;
                }
                .coupon-apply-btn:hover { background: #C4612E; }

                .coupon-remove-btn {
                    padding: 12px 20px;
                    background: #fee2e2; color: #dc2626;
                    border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px; font-weight: 600;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    white-space: nowrap;
                    transition: background 0.2s;
                    flex-shrink: 0;
                }
                .coupon-remove-btn:hover { background: #fecaca; }

                .confirm-btn {
                    width: 100%;
                    padding: 18px 24px;
                    background: #111; color: #fff;
                    border: none; cursor: pointer;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; font-weight: 600;
                    letter-spacing: 0.16em; text-transform: uppercase;
                    transition: background 0.2s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    margin-top: 20px;
                }
                .confirm-btn:hover:not(:disabled) { background: #C4612E; }
                .confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .back-link {
                    display: inline-flex; align-items: center; gap: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; font-weight: 500;
                    letter-spacing: 0.08em; text-transform: uppercase;
                    color: #888; background: none; border: none;
                    cursor: pointer;
                    transition: color 0.2s;
                    padding: 0;
                }
                .back-link:hover { color: #C4612E; }

                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 60px;
                    align-items: start;
                }

                @media (max-width: 960px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                .info-banner {
                    padding: 20px 22px;
                    background: #f6f3fa;
                    border-left: 3px solid #2D1B69;
                    display: flex; gap: 14px; align-items: flex-start;
                }

                .summary-sticky {
                    position: sticky;
                    top: 24px;
                }
            `}</style>

            {/* ── Page Header Bar ── */}
            <header style={{ position: "relative", width: "100%", overflow: "hidden", minHeight: "30vh", display: "flex", alignItems: "center" }}>
                {/* Background Image */}
                <Image src="/img/art/art1.png" alt="Checkout Background" fill style={{ objectFit: "cover" }} />
                {/* Dark Overlay Filter */}
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(17, 17, 17, 0.75)" }} />

                <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "36px 40px", position: "relative", zIndex: 1 }}>
                    <button
                        className="back-link"
                        onClick={() => router.push("/cart")}
                        style={{ color: "rgba(255,255,255,0.7)", marginBottom: 16 }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>{t("backToCart")}</span>
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <h1 style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: "clamp(32px, 5vw, 54px)",
                            fontWeight: 300, color: "#fff",
                            margin: 0, lineHeight: 1, letterSpacing: "-0.01em",
                            textShadow: "0 4px 12px rgba(0,0,0,0.3)"
                        }}>
                            {t("title")}
                        </h1>
                        {/* Step indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
                            <div style={{ width: 6, height: 6, background: "#C4612E", transform: "rotate(45deg)" }} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                Paso final
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom accent line */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #C4612E 0%, #2D1B69 50%, #C4612E 100%)" }} />
            </header>

            {/* ── Main Content ── */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 40px 80px" }}>
                <form onSubmit={handleConfirmOrder}>
                    <div className="checkout-grid">

                        {/* ══ LEFT COLUMN: Forms ══ */}
                        <div>

                            {/* Contact Info Section */}
                            <div className="co-section" style={{ animationDelay: "0s" }}>
                                <h2 className="co-section-title">{t("contactInfo")}</h2>

                                <div style={{ display: "grid", gap: 20 }}>
                                    {/* Email */}
                                    <div>
                                        <label className="co-label" htmlFor="checkout-email">
                                            {t("email")} <span style={{ color: "#C4612E" }}>*</span>
                                        </label>
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="co-input"
                                            required
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="co-label" htmlFor="checkout-name">
                                            {t("fullName")} <span style={{ color: "#C4612E" }}>*</span>
                                        </label>
                                        <input
                                            id="checkout-name"
                                            type="text"
                                            value={form.full_name}
                                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            className="co-input"
                                            required
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address Section */}
                            <div className="co-section" style={{ animationDelay: "0.08s" }}>
                                <h2 className="co-section-title">{t("shippingAddress")}</h2>

                                <div style={{ display: "grid", gap: 20 }}>
                                    {/* Country */}
                                    <div>
                                        <label className="co-label" htmlFor="checkout-country">
                                            {t("country")} <span style={{ color: "#C4612E" }}>*</span>
                                        </label>
                                        <select
                                            id="checkout-country"
                                            value={address.country}
                                            onChange={(e) => handleCountryChange(e.target.value)}
                                            className={`co-select${validationErrors.country ? " error" : ""}`}
                                            required
                                        >
                                            <option value="">Selecciona tu país</option>
                                            {allCountries.map((c) => (
                                                <option key={c.id} value={c.code}>
                                                    {c.name} {!c.shipping_zone ? " (no disponible)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.country && (
                                            <p className="field-error">{validationErrors.country}</p>
                                        )}
                                        {selectedCountryObj?.zone_name && (
                                            <p className="zone-info">
                                                Zona: {selectedCountryObj.zone_name}
                                                {selectedZone && ` — $${Number(selectedZone.price).toFixed(2)} base + $${Number(selectedZone.extra_per_item).toFixed(2)} por item extra`}
                                                {totalItems > 1 && ` (${totalItems} items: $${shippingCost.toFixed(2)})`}
                                            </p>
                                        )}
                                        {selectedCountryObj && !selectedCountryObj.shipping_zone && (
                                            <p className="zone-error">
                                                Lo sentimos, no hay envío disponible para {selectedCountryObj.name}.
                                            </p>
                                        )}
                                    </div>

                                    {/* Street */}
                                    <div>
                                        <label className="co-label" htmlFor="checkout-street">
                                            {t("street")} <span style={{ color: "#C4612E" }}>*</span>
                                        </label>
                                        <input
                                            id="checkout-street"
                                            type="text"
                                            value={address.street}
                                            onChange={(e) => handleAddressChange("street", e.target.value)}
                                            className={`co-input${validationErrors.street ? " error" : ""}`}
                                            required
                                            maxLength={200}
                                            placeholder={t("streetPlaceholder")}
                                        />
                                        {validationErrors.street && (
                                            <p className="field-error">{validationErrors.street}</p>
                                        )}
                                    </div>

                                    {/* City + State */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div>
                                            <label className="co-label" htmlFor="checkout-city">
                                                {t("city")} <span style={{ color: "#C4612E" }}>*</span>
                                            </label>
                                            <input
                                                id="checkout-city"
                                                type="text"
                                                value={address.city}
                                                onChange={(e) => handleAddressChange("city", e.target.value)}
                                                className={`co-input${validationErrors.city ? " error" : ""}`}
                                                required
                                                maxLength={100}
                                            />
                                            {validationErrors.city && (
                                                <p className="field-error">{validationErrors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="co-label" htmlFor="checkout-state">
                                                {t("state")}
                                            </label>
                                            <input
                                                id="checkout-state"
                                                type="text"
                                                value={address.state}
                                                onChange={(e) => handleAddressChange("state", e.target.value)}
                                                className="co-input"
                                                maxLength={100}
                                            />
                                        </div>
                                    </div>

                                    {/* Postal Code */}
                                    <div>
                                        <label className="co-label" htmlFor="checkout-postal">
                                            {t("postalCode")}
                                        </label>
                                        <input
                                            id="checkout-postal"
                                            type="text"
                                            value={address.postalCode}
                                            onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                                            className="co-input"
                                            maxLength={20}
                                        />
                                    </div>

                                    {/* Divider */}
                                    <div style={{ borderTop: "1px solid #ede9e2", paddingTop: 24 }}>
                                        {/* Coupon */}
                                        <label className="co-label">
                                            Código de Descuento <span style={{ color: "#aaa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Opcional)</span>
                                        </label>
                                        <div style={{ display: "flex", gap: 0 }}>
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="co-input"
                                                style={{ borderRight: "none" }}
                                                placeholder="Ej. VERANO20"
                                                disabled={!!appliedCoupon}
                                            />
                                            {!appliedCoupon ? (
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    className="coupon-apply-btn"
                                                >
                                                    Aplicar
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                                                    className="coupon-remove-btn"
                                                >
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                        {couponError && (
                                            <p style={{ marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#dc2626", fontWeight: 500 }}>
                                                {couponError}
                                            </p>
                                        )}
                                        {appliedCoupon && (
                                            <p style={{ marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#16a34a", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Cupón aplicado correctamente
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Address helper text */}
                                <p style={{
                                    marginTop: 16,
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: 12, color: "#aaa", fontStyle: "italic"
                                }}>
                                    {t("addressHelper")}
                                </p>
                            </div>

                            {/* Info Banner */}
                            <div className="info-banner" style={{ animationDelay: "0.16s" }}>
                                <svg style={{ width: 18, height: 18, color: "#2D1B69", flexShrink: 0, marginTop: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#2D1B69", lineHeight: 1.6 }}>
                                    <p style={{ fontWeight: 600, margin: "0 0 4px" }}>Información importante</p>
                                    <p style={{ margin: 0, color: "#555" }}>Al confirmar tu orden, nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para coordinar el pago y envío.</p>
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN: Summary ══ */}
                        <div className="summary-sticky">
                            {/* Summary panel with colored header */}
                            <div style={{ border: "1px solid #e8e4de", background: "#fff", overflow: "hidden" }}>
                                {/* Geometric panel header */}
                                <div style={{
                                    background: "#2D1B69",
                                    padding: "22px 28px",
                                    position: "relative",
                                    overflow: "hidden"
                                }}>
                                    <div style={{
                                        position: "absolute", top: 0, right: 0,
                                        width: 70, height: "100%",
                                        background: "#C4612E",
                                        clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)"
                                    }} />
                                    <span style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: 20, fontWeight: 400, color: "#fff",
                                        position: "relative", zIndex: 1
                                    }}>
                                        Resumen del Pedido
                                    </span>
                                </div>

                                <div style={{ padding: "8px 0" }}>
                                    <OrderSummary
                                        cart={cart}
                                        customerData={{ ...form, address: formatAddress(address) }}
                                        shippingCost={shippingCost}
                                        discountApplied={discountApplied}
                                    />
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="confirm-btn"
                            >
                                {submitting ? (
                                    <>
                                        <div style={{
                                            width: 16, height: 16, borderRadius: "50%",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            borderTopColor: "#fff",
                                            animation: "spin 0.7s linear infinite"
                                        }} />
                                        <span>{t("processing")}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t("confirmOrder")}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            {/* Security assurance row */}
                            <div style={{
                                marginTop: 16,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 20
                            }}>
                                {[
                                    { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "Seguro" },
                                    { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Pago protegido" },
                                ].map(({ icon, label }) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4612E" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                                        </svg>
                                        <span style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 10, color: "#aaa",
                                            letterSpacing: "0.06em", textTransform: "uppercase"
                                        }}>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Payment Method Modal (DEMO) */}
                <PaymentModal
                    isOpen={showPaymentModal}
                    total={cart?.total || 0}
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handlePaymentConfirmed}
                />
            </div>
        </main>
    );
}
