"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function ProductDetail({ product }: { product: any }) {
    const [selectedOptions, setSelectedOptions] = useState<any>({});
    const [activeImage, setActiveImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const totalPrice =
        Number(product.base_price) +
        Object.values(selectedOptions).reduce(
            (acc: number, val: any) => acc + Number(val?.base_extra_price || 0),
            0
        );

    const images = product.images ?? [];
    const mainImage = images[activeImage]?.image ? `${API_URL}${images[activeImage].image}` : null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Galería */}
                    <div className="space-y-4">
                        <div
                            className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-200 cursor-zoom-in"
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? "scale-150" : "scale-100"}`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-32 h-32 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            )}
                            {isZoomed && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                                    Click para alejar
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
                                            activeImage === i
                                                ? "border-amber-500 ring-2 ring-amber-200"
                                                : "border-stone-200 hover:border-stone-400"
                                        }`}
                                    >
                                        <img src={`${API_URL}${img.image}`} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col">
                        <div className="mb-2">
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full uppercase tracking-wider">
                                Artesanal
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-stone-900 leading-tight mb-4">
                            {product.name}
                        </h1>
                        <p className="text-stone-600 leading-relaxed mb-8 text-lg">
                            {product.description}
                        </p>

                        {/* Precio */}
                        <div className="flex items-baseline gap-3 mb-10 pb-10 border-b border-stone-200">
                            <span className="text-5xl font-bold text-amber-600">${totalPrice.toFixed(2)}</span>
                            {totalPrice !== Number(product.base_price) && (
                                <span className="text-xl text-stone-400 line-through">${Number(product.base_price).toFixed(2)}</span>
                            )}
                        </div>

                        {/* Opciones */}
                        <div className="space-y-8 mb-10">
                            {product.product_options?.map((po: any) => {
                                const opt = po.option;
                                return (
                                    <div key={opt.id}>
                                        <p className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wider">
                                            {opt.name}
                                        </p>
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

                        {/* CTA */}
                        <button className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                            Agregar al carrito
                        </button>

                        {/* Info adicional */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-stone-50 rounded-xl">
                                <svg className="w-6 h-6 mx-auto mb-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-xs text-stone-600 font-medium">Hecho a mano</p>
                            </div>
                            <div className="text-center p-4 bg-stone-50 rounded-xl">
                                <svg className="w-6 h-6 mx-auto mb-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-stone-600 font-medium">Envío 3-5 días</p>
                            </div>
                            <div className="text-center p-4 bg-stone-50 rounded-xl">
                                <svg className="w-6 h-6 mx-auto mb-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="text-xs text-stone-600 font-medium">Garantía 1 año</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
