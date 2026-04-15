"use client";

import { useState } from "react";
import Modal from "./Modal";

interface Field {
    key: string;
    label: string;
    type?: "text" | "number" | "email" | "select" | "textarea";
    options?: { value: any; label: string }[];
}

interface Props {
    title: string;
    items: any[];
    fields: Field[];
    onCreate: (data: any) => Promise<void>;
    onUpdate: (id: number, data: any) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export default function CrudTable({ title, items, fields, onCreate, onUpdate, onDelete }: Props) {
    const emptyForm = Object.fromEntries(fields.map((f) => [f.key, ""]));
    const [form, setForm] = useState<any>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId !== null) {
                await onUpdate(editingId, form);
            } else {
                await onCreate(form);
            }
            setForm(emptyForm);
            setEditingId(null);
            setModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setForm(Object.fromEntries(fields.map((f) => [f.key, item[f.key] ?? ""])));
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este registro?")) return;
        setLoading(true);
        try {
            await onDelete(id);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setForm(emptyForm);
        setEditingId(null);
        setModalOpen(true);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
                    <p className="text-sm text-stone-500 mt-1">{items.length} registros</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo
                </button>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">ID</th>
                            {fields.map((f) => (
                                <th key={f.key} className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">{f.label}</th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-stone-400 font-mono">{item.id}</td>
                                {fields.map((f) => (
                                    <td key={f.key} className="px-6 py-4 text-sm text-stone-700">
                                        {f.type === "select"
                                            ? f.options?.find((o) => o.value == item[f.key])?.label ?? item[f.key]
                                            : String(item[f.key] ?? "")}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={fields.length + 2} className="px-6 py-12 text-center text-stone-400">
                                    No hay registros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId !== null ? `Editar ${title}` : `Nuevo ${title}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label className="block text-sm font-medium text-stone-700 mb-1">{f.label}</label>
                            {f.type === "textarea" ? (
                                <textarea
                                    value={form[f.key]}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    rows={4}
                                    required
                                />
                            ) : f.type === "select" ? (
                                <select
                                    value={form[f.key]}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {f.options?.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.type || "text"}
                                    value={form[f.key]}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : editingId !== null ? "Actualizar" : "Crear"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
