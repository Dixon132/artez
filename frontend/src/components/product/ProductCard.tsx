import Link from "next/link";

export default function ProductCard({ product, locale }: { product: any; locale: string }) {
    return (
        <Link
            href={`/${locale}/products/${product.id}`}
            className="group block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300"
        >
            <div className="overflow-hidden aspect-square bg-stone-100">
                {product.images?.[0]?.image ? (
                    <img
                        src={product.images[0].image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🎵</div>
                )}
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-stone-800 text-base leading-snug group-hover:text-amber-600 transition-colors">
                    {product.name}
                </h3>
                <p className="mt-2 text-amber-600 font-bold text-lg">${Number(product.base_price).toFixed(2)}</p>
            </div>
        </Link>
    );
}
