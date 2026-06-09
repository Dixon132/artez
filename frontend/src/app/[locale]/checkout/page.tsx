"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";
import { cartApi, ordersApi, getSessionId, shippingZonesApi, couponsApi, countriesApi } from "@/services/api";
import OrderSummary from "@/components/checkout/OrderSummary";
import { gaBeginCheckout } from "@/lib/analytics";
import { fbInitiateCheckout } from "@/lib/fbpixel";
import PaymentModal from "@/components/checkout/PaymentModal";

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
                                    {/* Country selection (drives zone) */}
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            {t("country")} *
                                        </label>
                                        <select
                                            value={address.country}
                                            onChange={(e) => handleCountryChange(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900 bg-white ${validationErrors.country ? "border-red-500" : "border-stone-300"}`}
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
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.country}</p>
                                        )}
                                        {selectedCountryObj?.zone_name && (
                                            <p className="mt-1 text-sm text-amber-600 font-medium">
                                                Zona: {selectedCountryObj.zone_name}
                                                {selectedZone && ` - $${Number(selectedZone.price).toFixed(2)} base + $${Number(selectedZone.extra_per_item).toFixed(2)} por item extra`}
                                                {totalItems > 1 && ` (${totalItems} items: $${shippingCost.toFixed(2)})`}
                                            </p>
                                        )}
                                        {selectedCountryObj && !selectedCountryObj.shipping_zone && (
                                            <p className="mt-1 text-sm text-red-600 font-medium">
                                                Lo sentimos, no hay envío disponible para {selectedCountryObj.name}.
                                            </p>
                                        )}
                                    </div>

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

                                    <div className="pt-4 border-t border-stone-100">
                                        <label className="block text-sm font-medium text-stone-700 mb-2">
                                            Código de Descuento (Opcional)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                                                placeholder="Ej. VERANO20"
                                                disabled={!!appliedCoupon}
                                            />
                                            {!appliedCoupon ? (
                                                <button
                                                    type="button"
                                                    onClick={handleApplyCoupon}
                                                    className="px-6 py-3 bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-700 transition-colors"
                                                >
                                                    Aplicar
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                                                    className="px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    Quitar
                                                </button>
                                            )}
                                        </div>
                                        {couponError && <p className="mt-2 text-sm text-red-600 font-medium">{couponError}</p>}
                                        {appliedCoupon && <p className="mt-2 text-sm text-green-600 font-medium">Cupón aplicado correctamente</p>}
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
                            <OrderSummary
                                cart={cart}
                                customerData={{ ...form, address: formatAddress(address) }}
                                shippingCost={shippingCost}
                                discountApplied={discountApplied}
                            />

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
