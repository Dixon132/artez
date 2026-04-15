"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsApi, cartApi, getSessionId } from "@/services/api";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<any>({});
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [params.id]);

    const loadProduct = async () => {
        setLoading(true);
        const data = await productsApi.get(Number(params.id));
        setProduct(data);
        setLoading(false);
    };

    const calculateTotal = () => {
        if (!product) return 0;
        let total = Number(product.base_price);
        Object.values(selectedOptions).forEach((val: any) => {
            if (val) total += Number(val.base_extra_price);
        });
        return total * quantity;
    };

    const handleAddToCart = async () => {
        // Validar que se hayan seleccionado todas las opciones requeridas
        const missingOptions = product.product_options?.filter((po: any) => !selectedOptions[po.option.id]);
        if (missingOptions?.length > 0) {
            alert("Por favor selecciona todas las opciones");
            return;
        }

        setAdding(true);
        try {
            const sessionId = getSessionId();
            const options = Object.entries(selectedOptions).map(([optionId, value]: any) => ({
                option_id: Number(optionId),
                value_id: value.id,
            }));

            await cartApi.addItem({
                session_id: sessionId,
                product_id: product.id,
                quantity,
                options,
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Producto no encontrado</h2>
                    <button onClick={() => router.push("/products")} className="text-amber-600 hover:underline">
                        Volver a productos
                    </button>
                </div>
            </div>
        );
    }

    const images = product.images || [];
    const mainImage = images[activeImage]?.image || null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
            {/* Notificación de éxito */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Producto agregado al carrito!
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-16">
                        <button
                            onClick={() => router.push(`/${params.locale || 'es'}/products`)}
                            className="mb-8 flex items-center gap-2 text-stone-600 hover:text-amber-600 transition-colors"
                        >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a productos
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Galería */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-200">
                            {mainImage ? (
                                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-32 h-32 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                            activeImage === i ? "border-amber-500 ring-2 ring-amber-200" : "border-stone-200 hover:border-stone-400"
                                        }`}
                                    >
                                        <img src={img.image} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full uppercase tracking-wider">
                                {product.category_name}
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 leading-tight mb-4">{product.name}</h1>
                        <p className="text-stone-600 leading-relaxed mb-8 text-lg">{product.description}</p>

                        {/* Precio */}
                        <div className="flex items-baseline gap-3 mb-10 pb-10 border-b border-stone-200">
                            <span className="text-5xl font-bold text-amber-600">${calculateTotal().toFixed(2)}</span>
                        </div>

                        {/* Opciones */}
                        <div className="space-y-8 mb-10">
                            {product.product_options?.map((po: any) => {
                                const opt = po.option;
                                return (
                                    <div key={opt.id}>
                                        <p className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider">{opt.name}</p>
                                        <div className="flex flex-wrap gap-3">
                                            {opt.values.map((val: any) => {
                                                const isSelected = selectedOptions[opt.id]?.id === val.id;
                                                return (
                                                    <button
                                                        key={val.id}
                                                        onClick={() =>
                                                            setSelectedOptions((prev: any) => ({
                                                                ...prev,
                                                                [opt.id]: isSelected ? null : val,
                                                            }))
                                                        }
                                                        className={`px-5 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                                                            isSelected
                                                                ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200"
                                                                : "bg-white border-stone-300 text-stone-700 hover:border-amber-400 hover:shadow-md"
                                                        }`}
                                                    >
                                                        {val.name}
                                                        {Number(val.base_extra_price) > 0 && (
                                                            <span className="ml-2 opacity-70">+${val.base_extra_price}</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cantidad */}
                        <div className="mb-8">
                            <p className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider">Cantidad</p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg border-2 border-stone-300 hover:border-amber-400 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="text-2xl font-bold text-stone-900 w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg border-2 border-stone-300 hover:border-amber-400 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {adding ? "Agregando..." : "Agregar al carrito"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
