"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function ProductDetail({ product }: { product: any }) {
    const [selectedOptions, setSelectedOptions] = useState<any>({});
    const [activeImage, setActiveImage] = useState(0);

    const totalPrice =
        Number(product.base_price) +
        Object.values(selectedOptions).reduce(
            (acc: number, val: any) => acc + Number(val?.base_extra_price || 0),
            0
        );

    const images = product.images ?? [];

    return (
        <main className="min-h-screen bg-amber-50">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

                    {/* Galería */}
                    <div className="flex flex-col gap-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                            {images[activeImage]?.image ? (
                                <img
                                    src={`${API_URL}${images[activeImage].image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">🎵</div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-3">
                                {images.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                            activeImage === i ? "border-amber-500" : "border-stone-200 hover:border-stone-400"
                                        }`}
                                    >
                                        <img src={`${API_URL}${img.image}`} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-500 mb-3">Artesena</p>
                        <h1 className="text-4xl font-bold text-stone-900 leading-tight mb-4">{product.name}</h1>
                        <p className="text-stone-500 leading-relaxed mb-8">{product.description}</p>

                        {/* Precio */}
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-4xl font-bold text-amber-600">${totalPrice.toFixed(2)}</span>
                            {totalPrice !== Number(product.base_price) && (
                                <span className="text-stone-400 text-sm line-through">${Number(product.base_price).toFixed(2)}</span>
                            )}
                        </div>

                        {/* Opciones */}
                        {product.product_options?.map((po: any) => {
                            const opt = po.option;
                            return (
                                <div key={opt.id} className="mb-6">
                                    <p className="text-xs uppercase tracking-widest text-stone-500 mb-3 font-medium">{opt.name}</p>
                                    <div className="flex flex-wrap gap-2">
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
                                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                                        isSelected
                                                            ? "bg-amber-500 border-amber-500 text-white"
                                                            : "bg-white border-stone-300 text-stone-700 hover:border-amber-400"
                                                    }`}
                                                >
                                                    {val.name}
                                                    {Number(val.base_extra_price) > 0 && (
                                                        <span className="ml-1 opacity-70">+${val.base_extra_price}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* CTA */}
                        <button className="mt-4 w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl transition-colors text-base tracking-wide">
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
