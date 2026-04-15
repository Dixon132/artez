"use client";

import { useState, useEffect } from "react";
import { productsApi, categoriesApi } from "@/services/api";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [form, setForm] = useState({ name: "", description: "", base_price: "", category: "" });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [prods, cats] = await Promise.all([productsApi.list(), categoriesApi.list()]);
        setProducts(prods);
        setCategories(cats);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingProduct) {
                await productsApi.update(editingProduct.id, form);
            } else {
                await productsApi.create(form);
            }
            await loadData();
            setModalOpen(false);
            setForm({ name: "", description: "", base_price: "", category: "" });
            setEditingProduct(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este producto?")) return;
        setLoading(true);
        await productsApi.delete(id);
        await loadData();
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            description: product.description,
            base_price: product.base_price,
            category: product.category,
        });
        setModalOpen(true);
    };

    const openImageModal = (product: any) => {
        setSelectedProduct(product);
        setImageModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !selectedProduct) return;
        const file = e.target.files[0];
        setLoading(true);
        try {
            await productsApi.uploadImage(selectedProduct.id, file);
            await loadData();
            const updated = products.find(p => p.id === selectedProduct.id);
            setSelectedProduct(updated);
        } catch (error) {
            alert('Error al subir imagen');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm("¿Eliminar esta imagen?")) return;
        setLoading(true);
        await productsApi.deleteImage(selectedProduct.id, imageId);
        await loadData();
        const updated = products.find(p => p.id === selectedProduct.id);
        setSelectedProduct(updated);
        setLoading(false);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900">Productos</h2>
                    <p className="text-sm text-stone-500 mt-1">{products.length} productos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setForm({ name: "", description: "", base_price: "", category: "" });
                        setModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                >
                    + Nuevo Producto
                </button>
            </div>

            {loading && <div className="text-center py-8 text-stone-500">Cargando...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-stone-100 relative">
                            {product.images?.[0] ? (
                                <img src={product.images[0].image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <button
                                onClick={() => openImageModal(product)}
                                className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                            >
                                <svg className="w-4 h-4 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-stone-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-stone-500 mb-2 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lg font-bold text-amber-600">${product.base_price}</span>
                                <span className="text-xs text-stone-400">{product.category_name}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Crear/Editar */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900 mb-4">
                            {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Precio Base</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.base_price}
                                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
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
                                    {loading ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Imágenes */}
            {imageModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-stone-900">Imágenes de {selectedProduct.name}</h3>
                            <button onClick={() => setImageModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block w-full px-4 py-8 border-2 border-dashed border-stone-300 rounded-lg text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                                <svg className="w-12 h-12 mx-auto mb-2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-sm text-stone-600">Click para subir imagen</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {selectedProduct.images?.map((img: any) => (
                                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 group">
                                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => handleDeleteImage(img.id)}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
