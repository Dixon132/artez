"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { productsApi } from "@/services/api";

export default function ProductsPage() {
    const params = useParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        const data = await productsApi.list();
        setProducts(data);
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
            <div className="relative bg-gradient-to-r from-amber-600 to-amber-500 text-white py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-bold mb-4">Nuestros Instrumentos</h1>
                    <p className="text-xl text-amber-100">Artesanía boliviana de alta calidad</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-stone-500">Cargando productos...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-24 h-24 mx-auto mb-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-xl font-semibold text-stone-700 mb-2">No hay productos disponibles</h3>
                        <p className="text-stone-500">Vuelve pronto para ver nuestros instrumentos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/${params.locale || 'es'}/products/${product.id}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-400 hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0].image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-24 h-24 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-amber-600 text-sm font-medium rounded-full">
                                            Ver detalles
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-2">
                                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded uppercase tracking-wider">
                                            {product.category_name}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-amber-600">
                                            ${product.base_price}
                                        </span>
                                        <span className="text-xs text-stone-400">Desde</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
