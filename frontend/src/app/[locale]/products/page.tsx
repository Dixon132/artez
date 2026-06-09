import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
    getAlternateLinks,
    getBaseUrl,
    getCommonMetadata,
    getDefaultOgImage,
} from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import ItemListJsonLd from "@/components/seo/ItemListJsonLd";
import ProductsListClient from "./ProductsListClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchProducts(locale: string): Promise<any[]> {
    try {
        const res = await fetch(`${API_URL}/products/?lang=${locale}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : data.results ?? [];
    } catch {
        return [];
    }
}

interface PageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "products" });

    // Fetch products for the count in title
    const products = await fetchProducts(locale);
    const productCount = products.length;

    // Get translated title with product count
    const title = t("metaTitle", { count: productCount });
    const description = t("metaDescription");

    // Get alternate links (canonical + hreflang)
    const alternateLinks = getAlternateLinks("/products", locale);

    // Get common metadata (og:locale, alternateLocale)
    const commonMetadata = getCommonMetadata(locale);

    const currentBcp47 = localeToBcp47[locale as Locale];
    const ogImage = getDefaultOgImage();

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
            type: "website",
            locale: currentBcp47,
            alternateLocale: commonMetadata.openGraph?.alternateLocale,
            siteName: "Artesena",
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

export default async function ProductsPage({ params }: PageProps) {
    const { locale } = await params;
    const products = await fetchProducts(locale);
    const baseUrl = getBaseUrl();
    const productsPath = getLocalizedProductsPath(locale);

    // Breadcrumb items using next-intl routing pathname keys for proper localized links
    const breadcrumbItems = [
        { name: getHomeLabel(locale), href: `/${locale}`, pathKey: "/" },
        { name: getProductsLabel(locale), href: `/${locale}${productsPath}`, pathKey: "/products" },
    ];

    // ItemList products with localized URLs
    const itemListProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        url: `${baseUrl}/${locale}${productsPath}/${product.id}`,
    }));

    return (
        <>
            <BreadcrumbJsonLd items={breadcrumbItems} />
            <ItemListJsonLd products={itemListProducts} />
            <div className="max-w-7xl mx-auto px-6 md:px-8 pt-4">
                <Breadcrumb items={breadcrumbItems} />
            </div>
            <ProductsListClient />
        </>
    );
}
