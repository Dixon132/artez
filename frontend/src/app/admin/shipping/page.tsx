"use client";
import { useState, useEffect } from "react";
import { shippingZonesApi } from "@/services/api";

export default function ShippingZonesPage() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const loadZones = async () => {
        setLoading(true);
        const res = await shippingZonesApi.list();
        setZones(res.results || res);
        setLoading(false);
    };

    useEffect(() => {
        loadZones();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await shippingZonesApi.create({ name, price: parseFloat(price) });
        setName("");
        setPrice("");
        loadZones();
    };

    const handleDelete = async (id: number) => {
        if(confirm("¿Eliminar zona?")) {
            await shippingZonesApi.delete(id);
            loadZones();
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-black text-stone-900 mb-8">Zonas de Envío</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8 max-w-lg">
                <h2 className="text-lg font-bold mb-4">Agregar Zona (Ej. Europa)</h2>
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Continente / Zona</label>
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500" />
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">Precio ($)</label>
                        <input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500" />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition-colors">
                        Guardar
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">Zona</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">Costo de Envío</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-stone-500">Cargando...</td></tr>
                        ) : zones.map((z: any) => (
                            <tr key={z.id} className="hover:bg-stone-50">
                                <td className="px-6 py-4 text-sm font-bold text-stone-800">{z.name}</td>
                                <td className="px-6 py-4 text-sm text-stone-600">${z.price}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(z.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
