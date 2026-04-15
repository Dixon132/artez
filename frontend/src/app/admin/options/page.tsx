"use client";

import { useState, useEffect } from "react";
import { optionsApi, optionValuesApi } from "@/services/api";

export default function AdminOptionsPage() {
    const [options, setOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [valueModalOpen, setValueModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [form, setForm] = useState({ name: "" });
    const [valueForm, setValueForm] = useState({ option: "", name: "", base_extra_price: "", image: null as File | null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await optionsApi.list();
        setOptions(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingOption) {
                await optionsApi.update(editingOption.id, form);
            } else {
                await optionsApi.create(form);
            }
            await loadData();
            setModalOpen(false);
            setForm({ name: "" });
            setEditingOption(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta opción?")) return;
        setLoading(true);
        await optionsApi.delete(id);
        await loadData();
    };

    const handleEdit = (option: any) => {
        setEditingOption(option);
        setForm({ name: option.name });
        setModalOpen(true);
    };

    const openValueModal = (option: any) => {
        setSelectedOption(option);
        setValueForm({ option: option.id, name: "", base_extra_price: "0", image: null });
        setValueModalOpen(true);
    };

    const handleValueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('option', valueForm.option);
            formData.append('name', valueForm.name);
            formData.append('base_extra_price', valueForm.base_extra_price);
            if (valueForm.image) {
                formData.append('image', valueForm.image);
            }

            await optionValuesApi.create(formData);
            await loadData();
            setValueModalOpen(false);
            setValueForm({ option: "", name: "", base_extra_price: "0", image: null });
        } catch (error) {
            alert('Error al crear valor');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteValue = async (valueId: number) => {
        if (!confirm("¿Eliminar este valor?")) return;
        setLoading(true);
        await optionValuesApi.delete(valueId);
        await loadData();
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900">Opciones</h2>
                    <p className="text-sm text-stone-500 mt-1">{options.length} opciones</p>
                </div>
                <button
                    onClick={() => {
                        setEditingOption(null);
                        setForm({ name: "" });
                        setModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                >
                    + Nueva Opción
                </button>
            </div>

            {loading && <div className="text-center py-8 text-stone-500">Cargando...</div>}

            <div className="space-y-4">
                {options.map((option) => (
                    <div key={option.id} className="bg-white rounded-xl border border-stone-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-stone-900">{option.name}</h3>
                                <p className="text-sm text-stone-500">{option.values?.length || 0} valores</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openValueModal(option)}
                                    className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 text-sm font-medium rounded-lg transition-colors"
                                >
                                    + Agregar Valor
                                </button>
                                <button
                                    onClick={() => handleEdit(option)}
                                    className="p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(option.id)}
                                    className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {option.values && option.values.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {option.values.map((value: any) => (
                                    <div key={value.id} className="border border-stone-200 rounded-lg p-3 flex items-center gap-3">
                                        {value.image && (
                                            <img src={`http://127.0.0.1:8000${value.image}`} alt={value.name} className="w-12 h-12 rounded object-cover" />
                                        )}
                                        <div className="flex-1">
                                            <div className="font-medium text-stone-900 text-sm">{value.name}</div>
                                            <div className="text-xs text-amber-600">+${value.base_extra_price}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteValue(value.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal Opción */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-4">
                            {editingOption ? "Editar Opción" : "Nueva Opción"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ name: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="Ej: Madera, Estuche"
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
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Guardando..." : editingOption ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Valor */}
            {valueModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-4">
                            Nuevo Valor para {selectedOption?.name}
                        </h3>
                        <form onSubmit={handleValueSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={valueForm.name}
                                    onChange={(e) => setValueForm({ ...valueForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="Ej: Naranjillo, Premium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Precio Extra</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valueForm.base_extra_price}
                                    onChange={(e) => setValueForm({ ...valueForm, base_extra_price: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Imagen (opcional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setValueForm({ ...valueForm, image: e.target.files?.[0] || null })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setValueModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Guardando..." : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
