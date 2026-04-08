"use client";

import { useState } from "react";

interface Field {
    key: string;
    label: string;
    type?: "text" | "number" | "email" | "select";
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
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setForm(Object.fromEntries(fields.map((f) => [f.key, item[f.key] ?? ""])));
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

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
                <p className="text-sm text-stone-400 mt-1">{items.length} registro{items.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
                <h3 className="text-sm font-semibold text-stone-600 mb-4">
                    {editingId !== null ? "✏️ Editando registro #" + editingId : "➕ Nuevo registro"}
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                    {fields.map((f) => (
                        <div key={f.key} className="flex flex-col gap-1 min-w-36">
                            <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{f.label}</label>
                            {f.type === "select" ? (
                                <select
                                    value={form[f.key]}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                >
                                    <option value="">-- seleccionar --</option>
                                    {f.options?.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={f.type || "text"}
                                    value={form[f.key]}
                                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {editingId !== null ? "Actualizar" : "Crear"}
                        </button>
                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={() => { setForm(emptyForm); setEditingId(null); }}
                                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">ID</th>
                            {fields.map((f) => (
                                <th key={f.key} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{f.label}</th>
                            ))}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-amber-50 transition-colors">
                                <td className="px-4 py-3 text-stone-400 font-mono text-xs">{item.id}</td>
                                {fields.map((f) => (
                                    <td key={f.key} className="px-4 py-3 text-stone-700">
                                        {f.type === "select"
                                            ? f.options?.find((o) => o.value == item[f.key])?.label ?? item[f.key]
                                            : String(item[f.key] ?? "")}
                                    </td>
                                ))}
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={fields.length + 2} className="px-4 py-10 text-center text-stone-400">
                                    Sin registros aún
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
