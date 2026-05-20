"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { cartApi, ordersApi, getSessionId } from "@/services/api";
import OrderSummary from "@/components/checkout/OrderSummary";
import { gaBeginCheckout } from "@/lib/analytics";
import { fbInitiateCheckout } from "@/lib/fbpixel";

const shippingCountries = [
    "United States", "Canada", "United Kingdom", "Germany", "France",
    "Spain", "Italy", "Netherlands", "Belgium", "Switzerland",
    "Australia", "Japan", "Brazil", "Argentina", "Chile",
    "Colombia", "Peru", "Mexico", "Bolivia"
] as const;

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
    
    // Simulación de pasarela de pago para la presentación de demostración
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<"qr" | "card" | "paypal">("qr");

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        const sessionId = getSessionId();
        const data = await cartApi.get(sessionId);
        setCart(data);
        setLoading(false);
        
        // Track begin checkout
        if (data && data.items.length > 0) {
            gaBeginCheckout(data);
            fbInitiateCheckout(data);
        }
    };

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required address fields
        const errors: Record<string, string> = {};
        if (!address.street.trim()) {
            errors.street = t("required");
        }
        if (!address.city.trim()) {
            errors.city = t("required");
        }
        if (!address.country.trim()) {
            errors.country = t("required");
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Abre el modal de pasarela de pagos simulada
        setShowPaymentModal(true);
    };

    const executeOrderCreation = async () => {
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
            });
            router.push(`/checkout/success?order=${response.order.id}` as any);
        } catch (error) {
            alert("Error al crear la orden");
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
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-900 mb-4">{t("title")}</h2>
                    <button
                        onClick={() => router.push("/products")}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                    >
                        {t("backToCart")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50 py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.push("/cart")}
                    className="mb-8 flex items-center gap-2 text-stone-600 hover:text-amber-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t("backToCart")}
                </button>

                <h1 className="text-3xl font-bold text-stone-900 mb-8">{t("title")}</h1>

                <form onSubmit={handleConfirmOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left column: Form */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-stone-900 mb-6">{t("contactInfo")}</h2>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            {t("email")} *
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                                            required
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            {t("fullName")} *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.full_name}
                                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                                            required
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-stone-900 mb-6">{t("shippingAddress")}</h2>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            {t("street")} *
                                        </label>
                                        <input
                                            type="text"
                                            value={address.street}
                                            onChange={(e) => handleAddressChange("street", e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 ${validationErrors.street ? "border-red-500" : "border-stone-300"}`}
                                            required
                                            maxLength={200}
                                            placeholder={t("streetPlaceholder")}
                                        />
                                        {validationErrors.street && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.street}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                {t("city")} *
                                            </label>
                                            <input
                                                type="text"
                                                value={address.city}
                                                onChange={(e) => handleAddressChange("city", e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 ${validationErrors.city ? "border-red-500" : "border-stone-300"}`}
                                                required
                                                maxLength={100}
                                            />
                                            {validationErrors.city && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                {t("state")}
                                            </label>
                                            <input
                                                type="text"
                                                value={address.state}
                                                onChange={(e) => handleAddressChange("state", e.target.value)}
                                                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                                                maxLength={100}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                {t("country")} *
                                            </label>
                                            <select
                                                value={address.country}
                                                onChange={(e) => handleAddressChange("country", e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 bg-white ${validationErrors.country ? "border-red-500" : "border-stone-300"}`}
                                                required
                                            >
                                                <option value="">{t("country")}</option>
                                                {shippingCountries.map((country) => (
                                                    <option key={country} value={country}>
                                                        {country}
                                                    </option>
                                                ))}
                                            </select>
                                            {validationErrors.country && (
                                                <p className="mt-1 text-sm text-red-600">{validationErrors.country}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                {t("postalCode")}
                                            </label>
                                            <input
                                                type="text"
                                                value={address.postalCode}
                                                onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                                                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                                                maxLength={20}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-stone-500 italic">
                                    {t("addressHelper")}
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-amber-800">
                                        <p className="font-semibold mb-1">Información importante</p>
                                        <p>Al confirmar tu orden, nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para coordinar el pago y envío.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column: Summary */}
                        <div className="lg:sticky lg:top-8 lg:self-start">
                            <OrderSummary cart={cart} customerData={{ ...form, address: formatAddress(address) }} />
                            
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-6 py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {submitting ? t("processing") : t("confirmOrder")}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Modal de Pago Simulado (Presentación de Demostración) ── */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
                    <div className="bg-white border border-stone-200/80 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col p-6 md:p-8 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                            <h3 className="font-serif text-2xl font-semibold text-stone-900">
                                Método de Pago
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 hover:bg-stone-50 rounded-full"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="grid grid-cols-3 gap-2.5 mt-6">
                            {(["qr", "card", "paypal"] as const).map((method) => {
                                const active = selectedMethod === method;
                                const label = method === "qr" ? "Código QR" : method === "card" ? "Tarjeta" : "PayPal";
                                return (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setSelectedMethod(method)}
                                        className={[
                                            "py-3 px-1 rounded-xl text-xs font-semibold border-2 transition-all duration-200 text-center",
                                            active
                                                ? "border-amber-500 bg-amber-50/50 text-amber-950 font-bold shadow-amber-100 shadow-md"
                                                : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:text-stone-700",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Panels */}
                        <div className="mt-6 flex-1">
                            {selectedMethod === "qr" && (
                                <div className="text-center flex flex-col items-center gap-4">
                                    <p className="text-stone-600 text-xs font-light leading-relaxed">
                                        Escanea este código QR desde tu app bancaria móvil de preferencia para efectuar la simulación de transferencia.
                                    </p>
                                    
                                    {/* Mock QR display with glowing amber borders */}
                                    <div className="p-4 bg-gradient-to-br from-[#faf8f5] to-amber-50 border border-amber-200 rounded-3xl shadow-sm relative group">
                                        <svg width="150" height="150" viewBox="0 0 29 29" fill="none" className="text-stone-900 mx-auto">
                                            {/* Outer Frame */}
                                            <path d="M0 0h7v7H0V0zm1 1v5h5V1H1zm1 1h3v3H2V2zm0 20h7v7H0v-7zm1 1v5h5v-5H1zm1 1h3v3H2v-3zm20-22h7v7h-7V0zm1 1v5h5V1h-5zm1 1h3v3H23V2z" fill="currentColor"/>
                                            {/* Dummy QR pixels pattern */}
                                            <path d="M9 0h1v1H9V0zm2 0h2v1h-2V0zm3 0h1v1h-1V0zm2 0h2v1h-2V0zm4 0h1v1h-1V0zm-12 2h1v1H9V2zm4 0h1v1h-1V2zm3 0h1v2h-1V2zm3 0h1v1h-1V2zm2 0h2v1h-2V2zm-9 4h1v1H9V4zm4 0h1v1h-1V4zm4 0h2v1h-2V4zm2 0h1v1h-1V4zm-11 2h1v1H8V6zm2 0h1v1h-1V6zm3 0h3v1h-3V6zm5 0h1v1h-1V6zm-10 8h1v1H9v-1zm2 0h2v1h-2v-1zm3 0h2v1h-2v-1zm4 0h2v1h-2v-1zm-11 2h2v1H8v-1zm3 0h1v1h-1v-1zm3 0h2v1h-2v-1zm4 0h1v1h-1v-1zm-11 2h1v1H9v-1zm3 0h1v1h-1v-1zm3 0h2v1h-2v-1zm3 0h1v1h-1v-1zm-11 2h2v1H8v-1zm4 0h2v1h-2v-1zm3 0h1v1h-1v-1zm-11 2h1v1H9v-1zm2 0h1v1h-1v-1zm3 0h1v1h-1v-1zm3 0h3v1h-3v-1zm-10 2h1v1H9v-1zm3 0h2v1h-2v-1zm3 0h1v1h-1v-1zm2 0h2v1h-2v-1z" fill="currentColor"/>
                                        </svg>
                                        <div className="absolute inset-0 border border-amber-500/10 rounded-3xl pointer-events-none group-hover:border-amber-500/25 transition-all duration-300" />
                                    </div>

                                    <div className="text-[10px] text-stone-400 font-sans uppercase tracking-wider mt-1">
                                        Monto total a pagar: <span className="font-serif text-stone-850 font-bold text-base block mt-0.5">${cart.total.toFixed(2)}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={executeOrderCreation}
                                        className="w-full mt-2 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-xl shadow-stone-900/10 active:scale-[0.98] text-[15px]"
                                    >
                                        Aceptar y Confirmar Pago
                                    </button>
                                </div>
                            )}

                            {selectedMethod === "card" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Nombre en la tarjeta</label>
                                        <input
                                            type="text"
                                            placeholder="Juan Pérez"
                                            disabled
                                            className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-400 cursor-not-allowed text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Número de tarjeta</label>
                                        <input
                                            type="text"
                                            placeholder="•••• •••• •••• ••••"
                                            disabled
                                            className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-400 cursor-not-allowed text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Vencimiento</label>
                                            <input
                                                type="text"
                                                placeholder="MM/AA"
                                                disabled
                                                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-400 cursor-not-allowed text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">CVV</label>
                                            <input
                                                type="text"
                                                placeholder="•••"
                                                disabled
                                                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-400 cursor-not-allowed text-sm"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 leading-relaxed mt-2">
                                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <span className="font-bold block mb-0.5">Cobro por Tarjeta Inactivo</span>
                                            Esta pasarela de pago simulada está inactiva en la presentación. Por favor, selecciona la pestaña **Código QR** para confirmar tu orden de prueba.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedMethod === "paypal" && (
                                <div className="flex flex-col items-center gap-6 py-4">
                                    {/* Mock PayPal Button */}
                                    <div className="w-full py-4 bg-[#ffc439] rounded-2xl flex items-center justify-center font-bold text-[#003087] font-sans italic text-lg select-none cursor-not-allowed shadow-sm opacity-90 border border-amber-400">
                                        PayPal
                                    </div>

                                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 leading-relaxed max-w-sm">
                                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <span className="font-bold block mb-0.5">Cobro por PayPal Inactivo</span>
                                            La integración de demostración con PayPal está inactiva. Por favor, selecciona la pestaña **Código QR** para confirmar tu orden de prueba.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
