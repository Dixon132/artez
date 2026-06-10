"use client";

import { useState, useEffect } from "react";
import { categoriesApi } from "@/services/api";
import Pagination from "@/components/admin/Pagination";
import SearchBar from "@/components/admin/SearchBar";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [form, setForm] = useState({ name: "" });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = async () => {
        setLoading(true);
        const response = await categoriesApi.list('en', page, search);
        setCategories(response.results || response);
        if (response.count) {
            setTotalPages(Math.ceil(response.count / 10));
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingCategory) {
                await categoriesApi.update(editingCategory.id, form);
            } else {
                await categoriesApi.create(form);
            }
            await loadData();
            setModalOpen(false);
            setForm({ name: "" });
            setEditingCategory(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta categoría?")) return;
        setLoading(true);
        await categoriesApi.delete(id);
        await loadData();
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setForm({ name: category.name });
        setModalOpen(true);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-serif tracking-tight text-[#111]">Categorías</h2>
                    <p className="text-sm text-[#777] mt-1">{categories.length} categorías</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setForm({ name: "" });
                        setModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#111] hover:bg-[#C4612E] text-white font-medium rounded-lg transition-colors"
                >
                    + Nueva Categoría
                </button>
            </div>

            <div className="flex gap-4 items-center mb-6">
                <SearchBar 
                    value={search}
                    onChange={setSearch}
                    onSearch={() => { setPage(1); loadData(); }}
                    placeholder="Buscar categoría..."
                />
                <button 
                    onClick={() => { setPage(1); loadData(); }}
                    className="px-6 py-2 bg-[#e2ded9] hover:bg-[#d8d4cf] font-medium rounded-lg transition-colors"
                >
                    Buscar
                </button>
            </div>

            {loading && <div className="text-center py-8 text-[#777]">Cargando...</div>}

            <div className="bg-white rounded-xl border border-[#e8e4df] shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#faf9f8] border-b border-[#e8e4df]">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#777] uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-[#777] uppercase">Nombre</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-[#777] uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-amber-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-[#999] font-mono">{category.id}</td>
                                <td className="px-6 py-4 text-sm text-stone-700 font-medium">{category.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-2 text-[#555] hover:text-[#111] hover:bg-amber-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 text-[#555] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-[#111] mb-4">
                            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ name: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111] text-[#111]"
                                    required
                                />
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
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-[#111] hover:bg-[#C4612E] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Guardando..." : editingCategory ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
