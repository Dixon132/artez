import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

interface ApiProduct {
    id: number;
    name: string;
    updated_at?: string;
}

const STATIC_PAGES: Array<keyof typeof routing.pathnames> = [
    "/",
    "/products",
    "/about",
    "/contact",
];

function getLocalizedPath(
    pathnameKey: keyof typeof routing.pathnames,
    locale: Locale,
    params?: Record<string, string>
): string {
    const config = routing.pathnames[pathnameKey];

    let localizedPath: string;
    if (typeof config === "string") {
        localizedPath = config;
    } else {
        localizedPath = (config as Record<string, string>)[locale] || pathnameKey;
    }

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            localizedPath = localizedPath.replace(`[${key}]`, value);
        }
    }

    return localizedPath;
}

async function fetchProducts(): Promise<ApiProduct[]> {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/products/", {
            next: { revalidate: 3600 },
        });

        if (!response.ok) return [];

        const data = await response.json();
        return Array.isArray(data) ? data : data.results ?? [];
    } catch {
        return [];
    }
}

function buildAlternates(
    pathnameKey: keyof typeof routing.pathnames,
    params?: Record<string, string>
): { languages: Record<string, string> } {
    const baseUrl = getBaseUrl();
    const languages: Record<string, string> = {};

    for (const locale of locales) {
        const localizedPath = getLocalizedPath(pathnameKey, locale, params);
        languages[locale] = `${baseUrl}/${locale}${localizedPath === "/" ? "" : localizedPath}`;
    }

    return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();
    const products = await fetchProducts();
    const entries: MetadataRoute.Sitemap = [];

    for (const pathnameKey of STATIC_PAGES) {
        for (const locale of locales) {
            const localizedPath = getLocalizedPath(pathnameKey, locale);
            const url = `${baseUrl}/${locale}${localizedPath === "/" ? "" : localizedPath}`;

            entries.push({
                url,
                lastModified: new Date(),
                alternates: buildAlternates(pathnameKey),
            });
        }
    }

    for (const product of products) {
        const params = { id: String(product.id) };
        const lastModified = product.updated_at
            ? new Date(product.updated_at)
            : new Date();

        for (const locale of locales) {
            const localizedPath = getLocalizedPath("/products/[id]", locale, params);
            const url = `${baseUrl}/${locale}${localizedPath}`;

            entries.push({
                url,
                lastModified,
                alternates: buildAlternates("/products/[id]", params),
            });
        }
    }

    return entries;
}
