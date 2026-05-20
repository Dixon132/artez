import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAlternateLinks, getCommonMetadata, getBaseUrl } from "@/lib/seo";
import { localeToBcp47, type Locale } from "@/lib/i18n";
import ProductsListClient from "./ProductsListClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchProductCount(locale: string): Promise<number> {
    try {
        const res = await fetch(`${API_URL}/products/?lang=${locale}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return 0;
        const data = await res.json();
        return Array.isArray(data) ? data.length : 0;
    } catch {
        return 0;
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

    // Fetch product count for the title
    const productCount = await fetchProductCount(locale);

    // Get translated title with product count
    const title = t("metaTitle", { count: productCount });
    const description = t("metaDescription");

    // Get alternate links (canonical + hreflang)
    const { canonical, languages } = getAlternateLinks("/products", locale);

    // Get common metadata (og:locale, alternateLocale)
    const commonMeta = getCommonMetadata(locale);

    const currentBcp47 = localeToBcp47[locale as Locale];

    return {
        title,
        description,
        alternates: {
            canonical,
            languages,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            type: "website",
            locale: currentBcp47,
            alternateLocale: commonMeta.openGraph?.alternateLocale,
        },
    };
}

export default function ProductsPage() {
    return <ProductsListClient />;
}
