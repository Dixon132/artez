import type { Metadata } from "next";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import {
    getAlternateLinks,
    getBaseUrl,
    getCommonMetadata,
    getProductOgImage,
    truncate,
} from "@/lib/seo";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import ProductDetailClient from "./ProductDetailClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

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

    const title = product.name || "Product";
    const description = truncate(product.description || "", 160);

    // Get canonical URL and hreflang alternates
    const alternateLinks = getAlternateLinks(`/products/${id}`, locale);

    // Get common metadata (og:locale, alternateLocale)
    const commonMetadata = getCommonMetadata(locale);

    const currentBcp47 = localeToBcp47[locale as Locale];

    // Get OG image (product image or default fallback)
    const ogImage = getProductOgImage(product.images, title);

    return {
        title,
        description,
        alternates: {
            canonical: alternateLinks.canonical,
            languages: alternateLinks.languages,
        },
        openGraph: {
            title,
            description,
            images: [
                {
                    url: ogImage.url,
                    width: ogImage.width,
                    height: ogImage.height,
                    alt: ogImage.alt,
                },
            ],
            url: alternateLinks.canonical,
            type: "website" as const,
            locale: currentBcp47,
            alternateLocale: commonMetadata.openGraph?.alternateLocale,
            siteName: "Artesena",
        },
        other: {
            "og:type": "product",
            "product:price:amount": String(product.base_price),
            "product:price:currency": "USD",
            "product:availability": "in stock",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage.url],
        },
    };
}

/**
 * Returns the localized products path for a given locale.
 */
function getLocalizedProductsPath(locale: string): string {
    const paths: Record<string, string> = {
        en: "/products",
        es: "/productos",
        fr: "/produits",
    };
    return paths[locale] || "/products";
}

/**
 * Returns the localized "Home" label for breadcrumbs.
 */
function getHomeLabel(locale: string): string {
    const labels: Record<string, string> = {
        en: "Home",
        es: "Inicio",
        fr: "Accueil",
    };
    return labels[locale] || "Home";
}

/**
 * Returns the localized "Products" label for breadcrumbs.
 */
function getProductsLabel(locale: string): string {
    const labels: Record<string, string> = {
        en: "Products",
        es: "Productos",
        fr: "Produits",
    };
    return labels[locale] || "Products";
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { locale, id } = await params;
    const product = await fetchProduct(id, locale);
    const baseUrl = getBaseUrl();
    const productsPath = getLocalizedProductsPath(locale);

    // Breadcrumb items using next-intl routing pathname keys for proper localized links
    const breadcrumbItems = [
        { name: getHomeLabel(locale), href: `/${locale}`, pathKey: "/" },
        { name: getProductsLabel(locale), href: `/${locale}${productsPath}`, pathKey: "/products" },
        ...(product
            ? [{ name: product.name, href: `/${locale}${productsPath}/${id}`, pathKey: "/products/[id]", params: { id } }]
            : []),
    ];

    return (
        <>
            {product && (
                <ProductJsonLd
                    name={product.name}
                    description={product.description}
                    base_price={product.base_price}
                    images={product.images}
                    sku={product.sku}
                    category={product.category_name}
                />
            )}
            <BreadcrumbJsonLd items={breadcrumbItems} />
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4">
                <Breadcrumb items={breadcrumbItems} />
            </div>
            <ProductDetailClient />
        </>
    );
}
