import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

interface ApiProduct {
    id: number;
    name: string;
    updated_at?: string;
}

interface SitemapPageConfig {
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly" | "always" | "hourly" | "never";
}

/**
 * Priority and changeFrequency configuration per page type.
 * Home: highest priority, weekly updates
 * Products List: high priority, daily updates (new products)
 * Product Detail: medium-high priority, daily updates (price/stock changes)
 * About/Contact: lower priority, monthly updates (static content)
 */
const PAGE_CONFIG: Record<string, SitemapPageConfig> = {
    "/": { priority: 1.0, changeFrequency: "weekly" },
    "/products": { priority: 0.8, changeFrequency: "daily" },
    "/products/[id]": { priority: 0.7, changeFrequency: "daily" },
    "/about": { priority: 0.6, changeFrequency: "monthly" },
    "/contact": { priority: 0.6, changeFrequency: "monthly" },
};

/**
 * Static pages to include in the sitemap.
 * Cart and Checkout are excluded as they are non-indexable pages.
 */
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchProducts(): Promise<ApiProduct[]> {
    try {
        const response = await fetch(`${API_URL}/products/`, {
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

    // Generate entries for static pages (Home, Products List, About, Contact)
    // Cart and Checkout are excluded (non-indexable)
    for (const pathnameKey of STATIC_PAGES) {
        const config = PAGE_CONFIG[pathnameKey];

        for (const locale of locales) {
            const localizedPath = getLocalizedPath(pathnameKey, locale);
            const url = `${baseUrl}/${locale}${localizedPath === "/" ? "" : localizedPath}`;

            entries.push({
                url,
                lastModified: new Date(),
                changeFrequency: config?.changeFrequency ?? "monthly",
                priority: config?.priority ?? 0.5,
                alternates: buildAlternates(pathnameKey),
            });
        }
    }

    // Generate entries for all product detail pages
    for (const product of products) {
        const params = { id: String(product.id) };
        const lastModified = product.updated_at
            ? new Date(product.updated_at)
            : new Date();
        const config = PAGE_CONFIG["/products/[id]"];

        for (const locale of locales) {
            const localizedPath = getLocalizedPath("/products/[id]", locale, params);
            const url = `${baseUrl}/${locale}${localizedPath}`;

            entries.push({
                url,
                lastModified,
                changeFrequency: config?.changeFrequency ?? "daily",
                priority: config?.priority ?? 0.7,
                alternates: buildAlternates("/products/[id]", params),
            });
        }
    }

    return entries;
}
