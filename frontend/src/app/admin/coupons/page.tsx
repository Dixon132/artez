"use client";
import { useState, useEffect } from "react";
import { couponsApi } from "@/services/api";
import { Ticket, Plus, Trash2, CheckCircle, XCircle, AlertCircle, Copy, Calendar } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import SearchBar from "@/components/admin/SearchBar";
import toast from 'react-hot-toast';

type CouponStatus = 'valid' | 'expiring' | 'expired' | 'inactive';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        code: '',
        discount_type: 'percent',
        discount_value: '',
        expires_in_months: '3'
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    const loadCoupons = async () => {
        setLoading(true);
        const res = await couponsApi.list(page, search);
        setCoupons(res.results || res);
        if (res.count) {
            setTotalPages(Math.ceil(res.count / 10));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCoupons();
    }, [page]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await couponsApi.generate({
            code: form.code || undefined,
            discount_type: form.discount_type,
            discount_value: parseFloat(form.discount_value),
            expires_in_months: form.expires_in_months
        });
        setModalOpen(false);
        setForm({ code: '', discount_type: 'percent', discount_value: '', expires_in_months: '3' });
        loadCoupons();
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Eliminar cupón?")) {
            await couponsApi.delete(id);
            loadCoupons();
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Código "${code}" copiado al portapapeles`);
    };

    const getCouponStatus = (coupon: any): { status: CouponStatus; label: string } => {
        if (!coupon.is_active) return { status: 'inactive', label: 'Inactivo' };
        if (!coupon.expires_at) return { status: 'valid', label: 'Vigente' };
        
        const expiresAt = new Date(coupon.expires_at);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) return { status: 'expired', label: 'Expirado' };
        if (daysUntilExpiry <= 7) return { status: 'expiring', label: `Vence en ${daysUntilExpiry}d` };
        return { status: 'valid', label: 'Vigente' };
    };

    const getStatusStyles = (status: CouponStatus) => {
        switch (status) {
            case 'valid': return 'bg-green-100 text-green-700 border-green-200';
            case 'expiring': return 'bg-[#f5f2ef] text-[#111] border-amber-200';
            case 'expired': return 'bg-red-100 text-red-700 border-red-200';
            case 'inactive': return 'bg-[#f5f2ef] text-[#777] border-[#e8e4df]';
        }
    };

    const getStatusIcon = (status: CouponStatus) => {
        switch (status) {
            case 'valid': return <CheckCircle className="w-4 h-4" />;
            case 'expiring': return <AlertCircle className="w-4 h-4" />;
            case 'expired': return <XCircle className="w-4 h-4" />;
            case 'inactive': return <XCircle className="w-4 h-4" />;
        }
    };

    const validCoupons = coupons.filter(c => getCouponStatus(c).status === 'valid');
    const expiringCoupons = coupons.filter(c => getCouponStatus(c).status === 'expiring');
    const expiredCoupons = coupons.filter(c => ['expired', 'inactive'].includes(getCouponStatus(c).status));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#111]">Cupones de Descuento</h1>
                    <p className="text-sm text-[#777] mt-1">Gestiona cupones de fidelización para tus clientes</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#C4612E] text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-200"
                >
                    <Plus className="w-5 h-5" />
                    Crear Cupón
                </button>
            </div>

            <div className="flex gap-4 items-center mb-6">
                <SearchBar 
                    value={search}
                    onChange={setSearch}
                    onSearch={() => { setPage(1); loadCoupons(); }}
                    placeholder="Buscar cupón..."
                />
                <button 
                    onClick={() => { setPage(1); loadCoupons(); }}
                    className="px-6 py-2 bg-[#e2ded9] hover:bg-[#d8d4cf] font-medium rounded-lg transition-colors"
                >
                    Buscar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e8e4df]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-serif tracking-tight text-[#111]">{validCoupons.length}</p>
                            <p className="text-sm text-[#777]">Vigentes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e8e4df]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f5f2ef] rounded-lg">
                            <AlertCircle className="w-5 h-5 text-[#111]" />
                        </div>
                        <div>
                            <p className="text-3xl font-serif tracking-tight text-[#111]">{expiringCoupons.length}</p>
                            <p className="text-sm text-[#777]">Por Vencer</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e8e4df]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-serif tracking-tight text-[#111]">{expiredCoupons.length}</p>
                            <p className="text-sm text-[#777]">Expirados / Inactivos</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="text-center py-8 text-[#777]">Cargando...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon: any) => {
                    const { status, label } = getCouponStatus(coupon);
                    return (
                        <div
                            key={coupon.id}
                            className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                                status === 'expired' || status === 'inactive'
                                    ? 'border-[#e8e4df] opacity-60'
                                    : 'border-[#e8e4df] hover:border-amber-300'
                            }`}
                        >
                            <div className={`px-4 py-3 border-b ${getStatusStyles(status)} flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(status)}
                                    <span className="text-sm font-semibold">{label}</span>
                                </div>
                                <span className="text-xs font-medium">#{coupon.id}</span>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="w-5 h-5 text-[#111]" />
                                        <span className="text-xl font-black text-[#111] tracking-wider">{coupon.code}</span>
                                    </div>
                                    <button
                                        onClick={() => copyCode(coupon.code)}
                                        className="p-2 text-[#999] hover:text-[#111] hover:bg-amber-50 rounded-lg transition-colors"
                                        title="Copiar código"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[#777]">Descuento</span>
                                        <span className="text-lg font-bold text-[#111]">
                                            {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                        </span>
                                    </div>
                                    {coupon.expires_at && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-[#777]">Vence</span>
                                            <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(coupon.expires_at).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[#777]">Estado</span>
                                        <span className={`text-sm font-medium ${coupon.times_used > 0 ? 'text-[#999]' : 'text-green-600'}`}>
                                            {coupon.times_used > 0 ? 'Canjeado' : 'Disponible'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {coupons.length === 0 && !loading && (
                <div className="text-center py-16">
                    <Ticket className="w-16 h-16 text-[#ccc] mx-auto mb-4" />
                    <p className="text-[#777]">No hay cupones creados</p>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-[#111] mb-4">Crear Nuevo Cupón</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Código (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111] uppercase tracking-wider font-mono"
                                    placeholder="Se genera aleatoriamente si se deja vacío"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de Descuento</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, discount_type: 'percent' })}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            form.discount_type === 'percent'
                                                ? 'border-[#111] bg-amber-50 text-[#111]'
                                                : 'border-[#e8e4df] text-[#555]'
                                        }`}
                                    >
                                        Porcentaje (%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, discount_type: 'fixed' })}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            form.discount_type === 'fixed'
                                                ? 'border-[#111] bg-amber-50 text-[#111]'
                                                : 'border-[#e8e4df] text-[#555]'
                                        }`}
                                    >
                                        Fijo ($)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                    Valor del Descuento
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.discount_value}
                                        onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                                        className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111]"
                                        placeholder={form.discount_type === 'percent' ? '15' : '50.00'}
                                        required
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">
                                        {form.discount_type === 'percent' ? '%' : '$'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Validez</label>
                                <select
                                    value={form.expires_in_months}
                                    onChange={(e) => setForm({ ...form, expires_in_months: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111]"
                                >
                                    <option value="3">3 meses</option>
                                    <option value="6">6 meses</option>
                                    <option value="12">1 año</option>
                                    <option value="">Sin expiración</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-stone-700 hover:bg-[#f5f2ef] rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#111] hover:bg-[#C4612E] text-white font-medium rounded-lg transition-colors"
                                >
                                    Crear Cupón
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
