import { getProducts } from "@/services/api";
import ProductCard from "@/components/product/ProductCard";

export default async function ProductsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const products = await getProducts(locale);

    return (
        <main className="min-h-screen bg-amber-50">
            {/* Header */}
            <div className="bg-stone-900 text-white px-8 py-20 text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-amber-400 mb-4">Catálogo</p>
                <h1 className="text-5xl font-bold leading-tight">
                    {locale === "es" ? "Nuestros Productos" : "Our Products"}
                </h1>
                <p className="mt-4 text-stone-400 text-lg max-w-xl mx-auto">
                    {locale === "es"
                        ? "Instrumentos artesanales hechos a mano con materiales naturales."
                        : "Handcrafted instruments made with natural materials."}
                </p>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {products.length === 0 ? (
                    <p className="text-center text-stone-400 py-20">No hay productos aún.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p: any) => (
                            <ProductCard key={p.id} product={p} locale={locale} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
