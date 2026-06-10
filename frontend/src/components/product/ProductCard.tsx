import Image from "next/image";
import { Link } from "@/lib/navigation";
import { getAbsoluteMediaUrl } from "@/services/api";

export default function ProductCard({ product, locale }: { product: any; locale: string }) {
    const imageUrl = product.images?.[0]?.image ? getAbsoluteMediaUrl(product.images[0].image) : null;
    const image2Url = product.images?.[1]?.image ? getAbsoluteMediaUrl(product.images[1].image) : null;

    return (
        <Link
            href={{ pathname: "/products/[id]" as const, params: { id: String(product.id) } }}
            style={{
                display: "block",
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
            }}
            className="product-card-link"
        >
            <style>{`
                .product-card-link .pcard-img { transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94); }
                .product-card-link:hover .pcard-img { transform: scale(1.06); }
                .product-card-link .pcard-img-2 { transition: opacity 0.5s ease; opacity: 0; }
                .product-card-link:hover .pcard-img-2 { opacity: 1; }
                .product-card-link .pcard-img-1 { transition: opacity 0.5s ease; }
                .product-card-link:hover .pcard-img-1 { opacity: ${image2Url ? "0" : "1"}; }
                .product-card-link .pcard-overlay { transition: opacity 0.35s ease; opacity: 0; }
                .product-card-link:hover .pcard-overlay { opacity: 1; }
                .product-card-link .pcard-name { transition: opacity 0.2s; }
                .product-card-link:hover .pcard-name { opacity: 0.6; }
            `}</style>
            {/* Image */}
            <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", background: "#f5f2ef" }}>
                {imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt={product.name || "Product"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            loading="lazy"
                            className="pcard-img pcard-img-1"
                            style={{ objectFit: "cover" }}
                        />
                        {image2Url && (
                            <Image
                                src={image2Url}
                                alt={product.name || "Product"}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                loading="lazy"
                                className="pcard-img pcard-img-2"
                                style={{ objectFit: "cover", position: "absolute", inset: 0 }}
                            />
                        )}
                    </>
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                            <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                        </svg>
                    </div>
                )}
                {/* Overlay */}
                <div
                    className="pcard-overlay"
                    style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)", display: "flex", alignItems: "flex-end", padding: "16px" }}
                >
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff" }}>
                        Ver producto
                    </span>
                </div>
            </div>
            {/* Info */}
            <div style={{ padding: "14px 0 0" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8a29e", marginBottom: "4px" }}>
                    {product.category_name}
                </p>
                <h3
                    className="pcard-name"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: 400, color: "#111", lineHeight: 1.2, marginBottom: "6px" }}
                >
                    {product.name}
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#777" }}>
                    ${Number(product.base_price).toFixed(2)}
                </p>
            </div>
        </Link>
    );
}
