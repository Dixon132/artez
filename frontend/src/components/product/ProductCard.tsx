import Link from "next/link";
import Image from "next/image";

const API_URL = "http://127.0.0.1:8000";

export default function ProductCard({ product, locale }: { product: any; locale: string }) {
    const imageUrl = product.images?.[0]?.image ? `${API_URL}${product.images[0].image}` : null;

    return (
        <Link
            href={`/${locale}/products/${product.id}`}
            className="group block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
        >
            <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-br from-stone-100 to-stone-200">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-20 h-20 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-medium rounded-full">
                        Ver detalles
                    </span>
                </div>
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-stone-900 text-lg leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                    {product.name}
                </h3>
                <p className="mt-3 text-amber-600 font-bold text-xl">${Number(product.base_price).toFixed(2)}</p>
            </div>
        </Link>
    );
}
