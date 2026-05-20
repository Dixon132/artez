import type { Metadata } from "next";
import { locales, localeToBcp47, type Locale } from "@/lib/i18n";
import { getAlternateLinks, getBaseUrl } from "@/lib/seo";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import ProductDetailClient from "./ProductDetailClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function truncate(text: string, maxLength: number): string {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
}

async function fetchProduct(id: string, lang: string) {
    try {
        const res = await fetch(`${API_URL}/products/${id}/?lang=${lang}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

interface PageProps {
    params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale, id } = await params;
    const product = await fetchProduct(id, locale);

    if (!product) {
        return {
            title: "Product not found",
            robots: {
                index: false,
            },
        };
    }

    const ogTitle = truncate(product.name || "", 95);
    const ogDescription = truncate(product.description || "", 200);

    // Get canonical URL and hreflang alternates using SEO utilities
    const localizedPathname = `/products/${id}`;
    const { canonical, languages } = getAlternateLinks(localizedPathname, locale);

    const currentBcp47 = localeToBcp47[locale as Locale] || "en_US";
    const alternateLocales = locales
        .filter((l) => l !== locale)
        .map((l) => localeToBcp47[l]);

    const images = product.images || [];
    const baseUrl = getBaseUrl();
    const ogImages = images.length > 0
        ? [{ url: images[0].image.startsWith("http") ? images[0].image : `${baseUrl}${images[0].image}` }]
        : [];

    return {
        title: ogTitle,
        description: ogDescription,
        alternates: {
            canonical,
            languages,
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            ...(ogImages.length > 0 && { images: ogImages }),
        },
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            ...(ogImages.length > 0 && { images: ogImages }),
            url: canonical,
            type: "website",
            locale: currentBcp47,
            alternateLocale: alternateLocales,
        },
        other: {
            "og:type": "og:product",
            "product:price:amount": String(product.base_price),
            "product:price:currency": "USD",
            "product:availability": "in stock",
        },
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { locale, id } = await params;
    const product = await fetchProduct(id, locale);

    return (
        <>
            {product && (
                <ProductJsonLd
                    name={product.name}
                    description={product.description}
                    base_price={product.base_price}
                    images={product.images}
                />
            )}
            <ProductDetailClient />
        </>
    );
}
