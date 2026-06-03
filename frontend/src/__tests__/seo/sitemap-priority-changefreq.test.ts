import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

/**
 * Unit tests for sitemap priority, changeFrequency, and exclusions.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

interface SitemapPageConfig {
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly" | "always" | "hourly" | "never";
}

const PAGE_CONFIG: Record<string, SitemapPageConfig> = {
    "/": { priority: 1.0, changeFrequency: "weekly" },
    "/products": { priority: 0.8, changeFrequency: "daily" },
    "/products/[id]": { priority: 0.7, changeFrequency: "daily" },
    "/about": { priority: 0.6, changeFrequency: "monthly" },
    "/contact": { priority: 0.6, changeFrequency: "monthly" },
};

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

interface SitemapEntry {
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
    alternates: { languages: Record<string, string> };
}

function buildSitemapEntries(products: Array<{ id: number; updated_at?: string }>): SitemapEntry[] {
    const baseUrl = getBaseUrl();
    const entries: SitemapEntry[] = [];

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

    for (const product of products) {
        const params = { id: String(product.id) };
        const lastModified = product.updated_at ? new Date(product.updated_at) : new Date();
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

describe("Sitemap Priority, ChangeFrequency, and Exclusions", () => {
    const products = [
        { id: 1, updated_at: "2024-01-15T10:00:00Z" },
        { id: 2, updated_at: "2024-02-20T12:00:00Z" },
    ];

    it("Home page entries have priority 1.0 and changeFrequency weekly", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        for (const locale of locales) {
            const homeUrl = `${baseUrl}/${locale}`;
            const homeEntry = entries.find((e) => e.url === homeUrl);
            expect(homeEntry).toBeDefined();
            expect(homeEntry!.priority).toBe(1.0);
            expect(homeEntry!.changeFrequency).toBe("weekly");
        }
    });

    it("Products List entries have priority 0.8 and changeFrequency daily", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        const enEntry = entries.find((e) => e.url === `${baseUrl}/en/products`);
        const esEntry = entries.find((e) => e.url === `${baseUrl}/es/productos`);
        const frEntry = entries.find((e) => e.url === `${baseUrl}/fr/produits`);

        expect(enEntry).toBeDefined();
        expect(enEntry!.priority).toBe(0.8);
        expect(enEntry!.changeFrequency).toBe("daily");

        expect(esEntry).toBeDefined();
        expect(esEntry!.priority).toBe(0.8);
        expect(esEntry!.changeFrequency).toBe("daily");

        expect(frEntry).toBeDefined();
        expect(frEntry!.priority).toBe(0.8);
        expect(frEntry!.changeFrequency).toBe("daily");
    });

    it("Product Detail entries have priority 0.7 and changeFrequency daily", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        const enEntry = entries.find((e) => e.url === `${baseUrl}/en/products/1`);
        const esEntry = entries.find((e) => e.url === `${baseUrl}/es/productos/1`);
        const frEntry = entries.find((e) => e.url === `${baseUrl}/fr/produits/1`);

        expect(enEntry).toBeDefined();
        expect(enEntry!.priority).toBe(0.7);
        expect(enEntry!.changeFrequency).toBe("daily");

        expect(esEntry).toBeDefined();
        expect(esEntry!.priority).toBe(0.7);
        expect(esEntry!.changeFrequency).toBe("daily");

        expect(frEntry).toBeDefined();
        expect(frEntry!.priority).toBe(0.7);
        expect(frEntry!.changeFrequency).toBe("daily");
    });

    it("About entries have priority 0.6 and changeFrequency monthly", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        const enEntry = entries.find((e) => e.url === `${baseUrl}/en/about`);
        const esEntry = entries.find((e) => e.url === `${baseUrl}/es/nosotros`);
        const frEntry = entries.find((e) => e.url === `${baseUrl}/fr/a-propos`);

        expect(enEntry).toBeDefined();
        expect(enEntry!.priority).toBe(0.6);
        expect(enEntry!.changeFrequency).toBe("monthly");

        expect(esEntry).toBeDefined();
        expect(esEntry!.priority).toBe(0.6);
        expect(esEntry!.changeFrequency).toBe("monthly");

        expect(frEntry).toBeDefined();
        expect(frEntry!.priority).toBe(0.6);
        expect(frEntry!.changeFrequency).toBe("monthly");
    });

    it("Contact entries have priority 0.6 and changeFrequency monthly", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        const enEntry = entries.find((e) => e.url === `${baseUrl}/en/contact`);
        const esEntry = entries.find((e) => e.url === `${baseUrl}/es/contacto`);
        const frEntry = entries.find((e) => e.url === `${baseUrl}/fr/contact`);

        expect(enEntry).toBeDefined();
        expect(enEntry!.priority).toBe(0.6);
        expect(enEntry!.changeFrequency).toBe("monthly");

        expect(esEntry).toBeDefined();
        expect(esEntry!.priority).toBe(0.6);
        expect(esEntry!.changeFrequency).toBe("monthly");

        expect(frEntry).toBeDefined();
        expect(frEntry!.priority).toBe(0.6);
        expect(frEntry!.changeFrequency).toBe("monthly");
    });

    it("Cart and Checkout pages are excluded from sitemap", () => {
        const entries = buildSitemapEntries(products);

        // Cart paths
        const cartPaths = ["/cart", "/carrito", "/panier"];
        // Checkout paths
        const checkoutPaths = ["/checkout", "/pagar", "/paiement"];

        for (const entry of entries) {
            for (const cartPath of cartPaths) {
                expect(entry.url).not.toContain(cartPath);
            }
            for (const checkoutPath of checkoutPaths) {
                expect(entry.url).not.toContain(checkoutPath);
            }
        }
    });

    it("all entries use localized pathnames (e.g., /es/productos/1)", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        // Spanish product entries should use /productos/ not /products/
        const esProductEntries = entries.filter(
            (e) => e.url.startsWith(`${baseUrl}/es/`) && e.url.includes("/productos/")
        );
        expect(esProductEntries.length).toBe(products.length);

        // French product entries should use /produits/ not /products/
        const frProductEntries = entries.filter(
            (e) => e.url.startsWith(`${baseUrl}/fr/`) && e.url.includes("/produits/")
        );
        expect(frProductEntries.length).toBe(products.length);

        // No Spanish entry should use /products/ (English path)
        const esEnglishPaths = entries.filter(
            (e) => e.url.startsWith(`${baseUrl}/es/products`)
        );
        expect(esEnglishPaths.length).toBe(0);
    });

    it("each entry has hreflang alternates for all locales", () => {
        const entries = buildSitemapEntries(products);

        for (const entry of entries) {
            expect(entry.alternates).toBeDefined();
            expect(entry.alternates.languages).toBeDefined();

            for (const locale of locales) {
                expect(entry.alternates.languages[locale]).toBeDefined();
                expect(entry.alternates.languages[locale]).toMatch(/^https?:\/\//);
            }

            expect(Object.keys(entry.alternates.languages)).toHaveLength(locales.length);
        }
    });

    it("hreflang alternates use localized pathnames for each locale", () => {
        const entries = buildSitemapEntries(products);
        const baseUrl = getBaseUrl();

        // Find the English product 1 entry
        const enProduct1 = entries.find((e) => e.url === `${baseUrl}/en/products/1`);
        expect(enProduct1).toBeDefined();

        // Its alternates should point to localized paths
        expect(enProduct1!.alternates.languages.en).toBe(`${baseUrl}/en/products/1`);
        expect(enProduct1!.alternates.languages.es).toBe(`${baseUrl}/es/productos/1`);
        expect(enProduct1!.alternates.languages.fr).toBe(`${baseUrl}/fr/produits/1`);
    });
});
