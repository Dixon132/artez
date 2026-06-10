"use client";

import { useState, useEffect } from "react";
import { productsApi, categoriesApi } from "@/services/api";
import Pagination from "@/components/admin/Pagination";
import SearchBar from "@/components/admin/SearchBar";
import { Package, Plus, Edit, Trash2, Image as ImageIcon, X, Upload, DollarSign, Tag } from "lucide-react";
import toast from 'react-hot-toast';

const API_URL = 'http://127.0.0.1:8000';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [form, setForm] = useState({ name: "", description: "", base_price: "", category: "" });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        loadData();
    }, [page, activeCategory]);

    const loadData = async () => {
        setLoading(true);
        const [prodsRes, catsRes] = await Promise.all([
            productsApi.list('en', page, search), 
            categoriesApi.list('en', 1, '')
        ]);
        let prods = prodsRes.results || prodsRes;
        if (activeCategory !== "all") {
            prods = prods.filter((p: any) => p.category === parseInt(activeCategory));
        }
        setProducts(prods);
        if (prodsRes.count) setTotalPages(Math.ceil(prodsRes.count / 10));
        setCategories(catsRes.results || catsRes);
        setLoading(false);
        return prods;
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
        await uploadImage(file);
    };

    const uploadImage = async (file: File) => {
        if (!selectedProduct) return;
        setLoading(true);
        try {
            const result = await productsApi.uploadImage(selectedProduct.id, file);
            if (result.error) {
                toast.error(`Error: ${result.error}`);
            } else {
                const newProds = await loadData();
                const updated = newProds.find((p: any) => p.id === selectedProduct.id);
                if (updated) setSelectedProduct(updated);
            }
        } catch (error) {
            toast.error('Error al subir imagen');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm("¿Eliminar esta imagen?")) return;
        setLoading(true);
        try {
            await productsApi.deleteImage(selectedProduct.id, imageId);
            const newProds = await loadData();
            const updated = newProds.find((p: any) => p.id === selectedProduct.id);
            if (updated) setSelectedProduct(updated);
        } catch (error) {
            toast.error('Error al eliminar imagen');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-serif tracking-tight text-[#111] flex items-center gap-2">
                        <Package className="w-7 h-7" />
                        Productos
                    </h2>
                    <p className="text-sm text-[#777] mt-1">{products.length} productos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setForm({ name: "", description: "", base_price: "", category: "" });
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#C4612E] text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                        activeCategory === "all"
                            ? "bg-[#111] border-[#111] text-white shadow-md"
                            : "bg-white border-[#e8e4df] text-[#555] hover:border-[#e2ded9]"
                    }`}
                >
                    Todos
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(String(cat.id))}
                        className={`px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                            activeCategory === String(cat.id)
                                ? "bg-[#111] border-[#111] text-white shadow-md"
                                : "bg-white border-[#e8e4df] text-[#555] hover:border-[#e2ded9]"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 items-center mb-6">
                <SearchBar 
                    value={search}
                    onChange={setSearch}
                    onSearch={() => { setPage(1); loadData(); }}
                    placeholder="Buscar producto..."
                />
                <button 
                    onClick={() => { setPage(1); loadData(); }}
                    className="px-6 py-2 bg-[#e2ded9] hover:bg-[#d8d4cf] font-medium rounded-lg transition-colors"
                >
                    Buscar
                </button>
            </div>

            {loading && <div className="text-center py-8 text-[#777]">Cargando...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="aspect-square bg-[#f5f2ef] relative group">
                            {product.images?.[0] ? (
                                <img 
                                    src={getImageUrl(product.images[0].image)} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#ccc]">
                                    <ImageIcon className="w-16 h-16" />
                                </div>
                            )}
                            <button
                                onClick={() => openImageModal(product)}
                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                                <ImageIcon className="w-5 h-5 text-stone-700" />
                            </button>
                            {product.images?.length > 0 && (
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                                    {product.images.length} {product.images.length === 1 ? 'imagen' : 'imágenes'}
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-[#111] text-lg">{product.name}</h3>
                                <span className="px-2 py-1 bg-[#f5f2ef] text-[#111] text-xs font-medium rounded-full flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {product.category_name}
                                </span>
                            </div>
                            <p className="text-sm text-[#777] mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl font-serif tracking-tight text-[#111] flex items-center gap-1">
                                    <DollarSign className="w-5 h-5" />
                                    {product.base_price}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#f5f2ef] hover:bg-[#e8e4df] text-stone-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="text-center py-16">
                    <Package className="w-16 h-16 text-[#ccc] mx-auto mb-4" />
                    <p className="text-[#777]">No hay productos</p>
                </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#111]">
                                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#999] hover:text-[#555]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111] text-[#111]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111] text-[#111]"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Precio Base</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.base_price}
                                        onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111] text-[#111]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-[#e2ded9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111] text-[#111]"
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
                                    className="flex-1 px-4 py-2 text-stone-700 hover:bg-[#f5f2ef] rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-[#111] hover:bg-[#C4612E] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {imageModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#111] flex items-center gap-2">
                                <ImageIcon className="w-6 h-6" />
                                Imágenes de {selectedProduct.name}
                            </h3>
                            <button onClick={() => setImageModalOpen(false)} className="text-[#999] hover:text-[#555]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div
                            className={`mb-6 border-2 border-dashed rounded-xl transition-all ${
                                dragOver ? "border-[#111] bg-amber-50" : "border-[#e2ded9]"
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <label className="block w-full px-4 py-12 text-center cursor-pointer">
                                <Upload className={`w-16 h-16 mx-auto mb-3 ${dragOver ? "text-[#111]" : "text-[#999]"}`} />
                                <p className="text-lg font-medium text-stone-700 mb-1">
                                    {dragOver ? "Suelta la imagen aquí" : "Arrastra una imagen o haz clic"}
                                </p>
                                <p className="text-sm text-[#777]">PNG, JPG hasta 10MB</p>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>

                        {selectedProduct.images?.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {selectedProduct.images.map((img: any) => (
                                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#e8e4df] group hover:border-[#111] transition-all">
                                        <img 
                                            src={getImageUrl(img.image)} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="p-3 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-[#999]">
                                <ImageIcon className="w-16 h-16 mx-auto mb-3" />
                                <p>No hay imágenes aún</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
