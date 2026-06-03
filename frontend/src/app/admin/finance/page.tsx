"use client";
import { useState, useEffect, useCallback } from "react";
import { financeApi } from "@/services/api";
import Pagination from "@/components/admin/Pagination";
import SearchBar from "@/components/admin/SearchBar";

type Period = 'week' | 'month' | 'year';

export default function FinancePage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState({ ingresos: 0, egresos: 0, balance: 0 });
    const [chartData, setChartData] = useState<{ ingresos: any[]; egresos: any[] }>({ ingresos: [], egresos: [] });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('month');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ type: 'ingreso', amount: '', description: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
    const [deleteCountdown, setDeleteCountdown] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [txRes, sumRes, chartRes] = await Promise.all([
                financeApi.list(page, '', search),
                financeApi.summary(),
                financeApi.chartData(period)
            ]);
            setTransactions(txRes.results || txRes || []);
            if (txRes.count) {
                setTotalPages(Math.ceil(txRes.count / 10));
            }
            setSummary(sumRes);
            setChartData(chartRes);
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    }, [period, page, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (deleteCountdown > 0) {
            const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [deleteCountdown]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financeApi.create({
                type: form.type,
                amount: parseFloat(form.amount),
                description: form.description
            });
            setModalOpen(false);
            setForm({ type: 'ingreso', amount: '', description: '' });
            fetchData();
        } catch (error) {
            console.error("Error creating transaction:", error);
        }
    };

    const handleDeleteClick = (transaction: any) => {
        setDeleteConfirm(transaction);
        setDeleteCountdown(5);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm || deleteCountdown > 0) return;
        try {
            await financeApi.delete(deleteConfirm.id);
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    const renderChart = () => {
        const allDates = new Set([
            ...chartData.ingresos.map(d => d.date),
            ...chartData.egresos.map(d => d.date)
        ]);
        const sortedDates = Array.from(allDates).sort();
        
        if (sortedDates.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-stone-400">
                    No hay datos para mostrar
                </div>
            );
        }

        const ingresosMap = new Map(chartData.ingresos.map(d => [d.date, d.total]));
        const egresosMap = new Map(chartData.egresos.map(d => [d.date, d.total]));

        let cumulativeIngresos = 0;
        let cumulativeEgresos = 0;
        const points = sortedDates.map(date => {
            cumulativeIngresos += ingresosMap.get(date) || 0;
            cumulativeEgresos += egresosMap.get(date) || 0;
            return { date, ingresos: cumulativeIngresos, egresos: cumulativeEgresos };
        });

        const maxVal = Math.max(...points.map(p => Math.max(p.ingresos, p.egresos)), 1);
        const width = 800;
        const height = 300;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const getX = (idx: number) => padding.left + (idx / Math.max(points.length - 1, 1)) * chartWidth;
        const getY = (val: number) => padding.top + chartHeight - (val / maxVal) * chartHeight;

        const ingresosPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.ingresos)}`).join(' ');
        const egresosPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.egresos)}`).join(' ');

        const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
            y: padding.top + chartHeight * (1 - pct),
            label: `$${Math.round(maxVal * pct)}`
        }));

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {gridLines.map((line, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={line.y}
                            x2={width - padding.right}
                            y2={line.y}
                            stroke="#e7e5e4"
                            strokeDasharray="4,4"
                        />
                        <text x={padding.left - 10} y={line.y + 4} textAnchor="end" className="text-xs fill-stone-400">
                            {line.label}
                        </text>
                    </g>
                ))}
                
                <path d={ingresosPath} fill="none" stroke="#16a34a" strokeWidth="2.5" />
                <path d={egresosPath} fill="none" stroke="#dc2626" strokeWidth="2.5" />
                
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={getX(i)} cy={getY(p.ingresos)} r="4" fill="#16a34a" />
                        <circle cx={getX(i)} cy={getY(p.egresos)} r="4" fill="#dc2626" />
                    </g>
                ))}

                {points.length > 0 && (
                    <>
                        <text x={padding.left} y={height - 10} className="text-xs fill-stone-500">
                            {sortedDates[0]}
                        </text>
                        <text x={width - padding.right} y={height - 10} textAnchor="end" className="text-xs fill-stone-500">
                            {sortedDates[sortedDates.length - 1]}
                        </text>
                    </>
                )}
            </svg>
        );
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-stone-900">Finanzas</h1>
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                >
                    + Nueva Transacción
                </button>
            </div>
            
            <div className="flex gap-4 items-center mb-6">
                <SearchBar 
                    value={search}
                    onChange={setSearch}
                    onSearch={() => { setPage(1); fetchData(); }}
                    placeholder="Buscar transacción..."
                />
                <button 
                    onClick={() => { setPage(1); fetchData(); }}
                    className="px-6 py-2 bg-stone-200 hover:bg-stone-300 font-medium rounded-lg transition-colors"
                >
                    Buscar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 text-sm font-medium mb-1">Total Ingresos</p>
                    <p className="text-3xl font-bold text-green-600">${summary.ingresos.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 text-sm font-medium mb-1">Total Egresos</p>
                    <p className="text-3xl font-bold text-red-600">${summary.egresos.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 text-sm font-medium mb-1">Balance General</p>
                    <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        ${summary.balance.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-stone-800">Evolución Financiera</h2>
                    <div className="flex gap-2">
                        {(['week', 'month', 'year'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    period === p
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {p === 'week' ? '1 Semana' : p === 'month' ? '1 Mes' : '1 Año'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-green-600 rounded"></div>
                        <span className="text-sm text-stone-600">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-red-600 rounded"></div>
                        <span className="text-sm text-stone-600">Egresos</span>
                    </div>
                </div>
                {renderChart()}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-200">
                    <h2 className="text-xl font-bold text-stone-800">Historial de Transacciones</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">Descripción</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase">Monto</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-stone-500">Cargando...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-stone-500">No hay transacciones registradas</td>
                                </tr>
                            ) : (
                                transactions.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-stone-500">#{t.id}</td>
                                        <td className="px-6 py-4 text-sm text-stone-800">
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                t.type === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {t.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-800">{t.description}</td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right ${
                                            t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {t.type === 'ingreso' ? '+' : '-'}${t.amount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(t)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar transacción"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-4">Nueva Transacción</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: 'ingreso' })}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            form.type === 'ingreso'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-stone-200 text-stone-600'
                                        }`}
                                    >
                                        Ingreso
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: 'egreso' })}
                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                            form.type === 'egreso'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-stone-200 text-stone-600'
                                        }`}
                                    >
                                        Egreso
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Monto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Justificación / Descripción</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    rows={3}
                                    placeholder="Ej: Pago de materiales, Venta de producto..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                                >
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-4">Confirmar Eliminación</h3>
                        <p className="text-stone-600 mb-2">
                            ¿Estás seguro de eliminar esta transacción?
                        </p>
                        <div className="bg-stone-50 rounded-lg p-4 mb-6">
                            <div className="text-sm text-stone-500">Transacción #{deleteConfirm.id}</div>
                            <div className="font-medium text-stone-900">{deleteConfirm.description}</div>
                            <div className={`font-bold ${deleteConfirm.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                {deleteConfirm.type === 'ingreso' ? '+' : '-'}${deleteConfirm.amount}
                            </div>
                        </div>
                        <p className="text-sm text-red-600 mb-6">
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteCountdown > 0}
                                className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                                    deleteCountdown > 0
                                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            >
                                {deleteCountdown > 0 ? `Esperar ${deleteCountdown}s...` : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
