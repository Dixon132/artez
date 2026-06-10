"use client";
import { useState, useEffect } from "react";
import { shippingZonesApi, countriesApi, continentsApi } from "@/services/api";

interface Country {
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
    continent_name: string | null;
    countries: Country[];
    country_count: number;
    created_at: string;
    updated_at: string;
}

interface Continent {
    id: number;
    name: string;
    code: string;
    zones: ShippingZone[];
}

export default function ShippingZonesPage() {
    const [continents, setContinents] = useState<Continent[]>([]);
    const [allCountries, setAllCountries] = useState<Country[]>([]);
    const [unassignedCountries, setUnassignedCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Create/Edit zone modal
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
    const [zoneForm, setZoneForm] = useState({ name: "", price: "", extra_per_item: "", continent_id: 0 });

    // Countries modal (add/remove)
    const [showCountriesModal, setShowCountriesModal] = useState(false);
    const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
    const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
    const [selectedCountryIds, setSelectedCountryIds] = useState<Set<number>>(new Set());
    const [countriesSearch, setCountriesSearch] = useState("");

    // Unassigned modal
    const [showUnassignedModal, setShowUnassignedModal] = useState(false);
    const [unassignedZoneTarget, setUnassignedZoneTarget] = useState<number | null>(null);
    const [unassignedSelected, setUnassignedSelected] = useState<Set<number>>(new Set());

    const loadAll = async () => {
        setLoading(true);
        try {
            const [contRes, countriesRes, unassignedRes] = await Promise.all([
                continentsApi.list(),
                countriesApi.list(),
                countriesApi.list({ unassigned: "true" }),
            ]);
            setContinents(contRes.results || contRes);
            setAllCountries(countriesRes.results || countriesRes);
            setUnassignedCountries(unassignedRes.results || unassignedRes);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => { loadAll(); }, []);

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ─── Zone Modal ───
    const openCreateZone = (continentId: number) => {
        setEditingZone(null);
        setZoneForm({ name: "", price: "", extra_per_item: "", continent_id: continentId });
        setShowZoneModal(true);
    };

    const openEditZone = (zone: ShippingZone) => {
        setEditingZone(zone);
        setZoneForm({
            name: zone.name,
            price: String(zone.price),
            extra_per_item: String(zone.extra_per_item),
            continent_id: zone.continent || 0,
        });
        setShowZoneModal(true);
    };

    const handleSaveZone = async () => {
        const payload: any = {
            name: zoneForm.name,
            price: parseFloat(zoneForm.price) || 0,
            extra_per_item: parseFloat(zoneForm.extra_per_item) || 0,
            continent_id: zoneForm.continent_id,
        };
        if (editingZone) {
            await shippingZonesApi.update(editingZone.id, payload);
        } else {
            await shippingZonesApi.create(payload);
        }
        setShowZoneModal(false);
        loadAll();
    };

    const handleDeleteZone = async (id: number) => {
        if (!confirm("¿Eliminar esta zona? Los países quedarán sin zona de envío.")) return;
        await shippingZonesApi.delete(id);
        loadAll();
    };

    // ─── Countries Modal (add to zone) ───
    const openAddCountries = async (zone: ShippingZone) => {
        setSelectedZone(zone);
        setCountriesSearch("");
        setSelectedCountryIds(new Set());
        const zoneCountryIds = new Set(zone.countries.map(c => c.id));
        const sameContCountries = (await countriesApi.list({ continent: continents.find(c => c.id === zone.continent)?.code })).results || [];
        const avail = sameContCountries.filter((c: Country) => c.shipping_zone === null);
        setAvailableCountries(avail);
        setShowCountriesModal(true);
    };

    const toggleCountrySelect = (id: number) => {
        setSelectedCountryIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleAddCountries = async () => {
        if (!selectedZone || selectedCountryIds.size === 0) return;
        await shippingZonesApi.addCountries(selectedZone.id, Array.from(selectedCountryIds));
        setShowCountriesModal(false);
        loadAll();
    };

    const handleRemoveCountry = async (zoneId: number, countryId: number) => {
        await shippingZonesApi.removeCountries(zoneId, [countryId]);
        loadAll();
    };

    // ─── Assign unassigned to zone ───
    const openAssignUnassigned = () => {
        setUnassignedSelected(new Set());
        setUnassignedZoneTarget(0);
        setShowUnassignedModal(true);
    };

    const toggleUnassignedSelect = (id: number) => {
        setUnassignedSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleAssignUnassigned = async () => {
        if (!unassignedZoneTarget || unassignedSelected.size === 0) return;
        await shippingZonesApi.addCountries(unassignedZoneTarget, Array.from(unassignedSelected));
        setShowUnassignedModal(false);
        loadAll();
    };

    const filteredAvailable = availableCountries.filter(c =>
        c.name.toLowerCase().includes(countriesSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(countriesSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-[#111] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#111]">Zonas de Envío</h1>
                    <p className="text-[#777] mt-1">Administra continentes, zonas, países y costos de envío</p>
                </div>
                {unassignedCountries.length > 0 && (
                    <button
                        onClick={openAssignUnassigned}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {unassignedCountries.length} países sin zona
                    </button>
                )}
            </div>

            {/* Continents Accordion */}
            <div className="space-y-4">
                {continents.map(continent => {
                    const contKey = `cont-${continent.id}`;
                    const isOpen = expanded[contKey];
                    return (
                        <div key={continent.id} className="bg-white rounded-xl shadow-sm border border-[#e8e4df] overflow-hidden">
                            <div
                                onClick={() => toggleExpand(contKey)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#faf9f8] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <svg className={`w-5 h-5 text-[#999] transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#111]">{continent.name}</h3>
                                        <p className="text-xs text-[#777]">{continent.zones?.length || 0} zonas</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openCreateZone(continent.id); }}
                                    className="px-4 py-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                                >
                                    + Zona
                                </button>
                            </div>

                            {isOpen && (
                                <div className="border-t border-stone-100">
                                    {(!continent.zones || continent.zones.length === 0) ? (
                                        <div className="px-6 py-8 text-center text-[#999]">
                                            No hay zonas creadas para este continente
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-stone-100">
                                            {continent.zones.map(zone => {
                                                const znKey = `zone-${zone.id}`;
                                                const znOpen = expanded[znKey];
                                                return (
                                                    <div key={zone.id}>
                                                        <div className="flex items-center justify-between px-6 py-3 hover:bg-[#faf9f8]">
                                                            <button
                                                                onClick={() => toggleExpand(znKey)}
                                                                className="flex items-center gap-4 flex-1 text-left"
                                                            >
                                                                <svg className={`w-4 h-4 text-[#999] transition-transform ${znOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                                <div>
                                                                    <span className="text-sm font-bold text-[#111]">{zone.name}</span>
                                                                    <span className="ml-3 text-xs text-[#777]">{zone.country_count} países</span>
                                                                </div>
                                                            </button>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-semibold text-[#111]">
                                                                    ${Number(zone.price).toFixed(2)}
                                                                    {Number(zone.extra_per_item) > 0 && (
                                                                        <span className="text-xs text-[#999] ml-1">+${Number(zone.extra_per_item).toFixed(2)}/item</span>
                                                                    )}
                                                                </span>
                                                                <button
                                                                    onClick={() => openEditZone(zone)}
                                                                    className="text-xs font-semibold text-[#777] hover:text-[#111]"
                                                                >
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => openAddCountries(zone)}
                                                                    className="text-xs font-semibold text-[#111] hover:text-[#111]"
                                                                >
                                                                    + Países
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteZone(zone.id)}
                                                                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {znOpen && (
                                                            <div className="px-10 py-3 bg-[#faf9f8]">
                                                                {zone.countries.length === 0 ? (
                                                                    <p className="text-sm text-[#999]">Sin países asignados</p>
                                                                ) : (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {zone.countries.map(c => (
                                                                            <span
                                                                                key={c.id}
                                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#e8e4df] rounded-full text-sm"
                                                                            >
                                                                                {c.name}
                                                                                <button
                                                                                    onClick={() => handleRemoveCountry(zone.id, c.id)}
                                                                                    className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                                                                                    title="Remover de zona"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ─── Zone Create/Edit Modal ─── */}
            {showZoneModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowZoneModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-[#111] mb-4">
                            {editingZone ? "Editar Zona" : "Nueva Zona"}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#777] mb-1 uppercase">Nombre de la zona</label>
                                <input
                                    type="text"
                                    value={zoneForm.name}
                                    onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#faf9f8] border border-[#e8e4df] rounded-lg outline-none focus:border-[#111]"
                                    placeholder="Ej. Europa Occidental"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#777] mb-1 uppercase">Precio base ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={zoneForm.price}
                                        onChange={e => setZoneForm({ ...zoneForm, price: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#faf9f8] border border-[#e8e4df] rounded-lg outline-none focus:border-[#111]"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-[#999] mt-1">Precio para 1 producto</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#777] mb-1 uppercase">Extra por ítem ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={zoneForm.extra_per_item}
                                        onChange={e => setZoneForm({ ...zoneForm, extra_per_item: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#faf9f8] border border-[#e8e4df] rounded-lg outline-none focus:border-[#111]"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-[#999] mt-1">Incremento por producto adicional</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowZoneModal(false)} className="flex-1 px-4 py-2 bg-[#f5f2ef] text-stone-700 font-semibold rounded-lg hover:bg-[#e8e4df]">
                                Cancelar
                            </button>
                            <button onClick={handleSaveZone} className="flex-1 px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Add Countries to Zone Modal ─── */}
            {showCountriesModal && selectedZone && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCountriesModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-[#111] mb-2">
                            Agregar países a {selectedZone.name}
                        </h2>
                        <p className="text-sm text-[#777] mb-4">
                            Solo se muestran países del mismo continente aún no asignados a esta zona.
                        </p>
                        <input
                            type="text"
                            value={countriesSearch}
                            onChange={e => setCountriesSearch(e.target.value)}
                            placeholder="Buscar país..."
                            className="w-full px-4 py-2 mb-3 bg-[#faf9f8] border border-[#e8e4df] rounded-lg outline-none focus:border-[#111]"
                        />
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
                            {filteredAvailable.length === 0 ? (
                                <p className="text-sm text-[#999] text-center py-4">No hay países disponibles</p>
                            ) : filteredAvailable.map(c => (
                                <label
                                    key={c.id}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedCountryIds.has(c.id) ? 'bg-amber-50 border border-amber-200' : 'hover:bg-[#faf9f8] border border-transparent'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCountryIds.has(c.id)}
                                        onChange={() => toggleCountrySelect(c.id)}
                                        className="w-4 h-4 text-[#111] rounded border-[#e2ded9] focus:ring-[#111]"
                                    />
                                    <span className="text-sm font-medium text-[#111]">{c.name}</span>
                                    <span className="text-xs text-[#999] ml-auto">{c.code}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-stone-100">
                            <button onClick={() => setShowCountriesModal(false)} className="flex-1 px-4 py-2 bg-[#f5f2ef] text-stone-700 font-semibold rounded-lg hover:bg-[#e8e4df]">
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCountries}
                                disabled={selectedCountryIds.size === 0}
                                className="flex-1 px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Agregar ({selectedCountryIds.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Assign Unassigned Modal ─── */}
            {showUnassignedModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowUnassignedModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-[#111] mb-2">
                            Países sin zona de envío
                        </h2>
                        <p className="text-sm text-[#777] mb-4">
                            Estos países no tienen envío disponible. Selecciona los que quieras asignar a una zona.
                        </p>

                        <div className="mb-3">
                            <label className="block text-xs font-bold text-[#777] mb-1 uppercase">Asignar a zona</label>
                            <select
                                value={unassignedZoneTarget || ""}
                                onChange={e => setUnassignedZoneTarget(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-[#faf9f8] border border-[#e8e4df] rounded-lg outline-none focus:border-[#111]"
                            >
                                <option value="">Selecciona una zona</option>
                                {continents.map(cont =>
                                    cont.zones?.map(z => (
                                        <option key={z.id} value={z.id}>
                                            {cont.name} → {z.name} (${Number(z.price).toFixed(2)})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
                            {unassignedCountries.map(c => (
                                <label
                                    key={c.id}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${unassignedSelected.has(c.id) ? 'bg-amber-50 border border-amber-200' : 'hover:bg-[#faf9f8] border border-transparent'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={unassignedSelected.has(c.id)}
                                        onChange={() => toggleUnassignedSelect(c.id)}
                                        className="w-4 h-4 text-[#111] rounded border-[#e2ded9] focus:ring-[#111]"
                                    />
                                    <span className="text-sm font-medium text-[#111]">{c.name}</span>
                                    <span className="text-xs text-[#999] ml-auto">{c.code}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4 pt-4 border-t border-stone-100">
                            <button onClick={() => setShowUnassignedModal(false)} className="flex-1 px-4 py-2 bg-[#f5f2ef] text-stone-700 font-semibold rounded-lg hover:bg-[#e8e4df]">
                                Cancelar
                            </button>
                            <button
                                onClick={handleAssignUnassigned}
                                disabled={!unassignedZoneTarget || unassignedSelected.size === 0}
                                className="flex-1 px-4 py-2 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Asignar ({unassignedSelected.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
