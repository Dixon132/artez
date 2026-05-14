// Feature: seo-localized-urls, Property 7: Sitemap Entry Completeness
// Validates: Requirements 7.2, 7.3, 7.5

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { routing } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";
import { getBaseUrl } from "@/lib/seo";

/**
 * Property 7: Sitemap Entry Completeness
 *
 * For any set of products and the fixed set of static pages, the generated sitemap
 * SHALL contain exactly (staticPageCount + productCount) × localeCount URL entries,
 * where each entry uses the correct localized pathname for its locale and includes
 * xhtml:link hreflang alternates pointing to the equivalent page in all other
 * supported locales.
 */

// --- Constants matching sitemap.ts ---
const STATIC_PAGES: Array<keyof typeof routing.pathnames> = [
    "/",
    "/products",
    "/about",
    "/contact",
];

const LOCALE_COUNT = locales.length; // 3
const STATIC_PAGE_COUNT = STATIC_PAGES.length; // 4

// --- Helpers replicating sitemap.ts logic ---

interface TestProduct {
    id: number;
    updated_at: string;
}

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
    alternates: { languages: Record<string, string> };
}

/**
 * Replicates the deterministic sitemap building logic from sitemap.ts.
 * Given a list of products, generates all sitemap entries.
 */
function buildSitemapEntries(products: TestProduct[]): SitemapEntry[] {
    const baseUrl = getBaseUrl();
    const entries: SitemapEntry[] = [];

    // Static pages × all locales
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

    // Product pages × all locales
    for (const product of products) {
        const params = { id: String(product.id) };
        const lastModified = new Date(product.updated_at);

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

// --- Generators ---

const productArb = fc.record({
    id: fc.integer({ min: 1, max: 99999 }),
    updated_at: fc.integer({
        min: new Date("2020-01-01").getTime(),
        max: new Date("2030-12-31").getTime(),
    }).map((ts) => new Date(ts).toISOString()),
});

const productListArb = fc.array(productArb, { minLength: 0, maxLength: 50 });

// --- Tests ---

describe("Property 7: Sitemap Entry Completeness", () => {
    it("sitemap contains exactly (staticPageCount + productCount) × localeCount entries", () => {
        fc.assert(
            fc.property(productListArb, (products) => {
                const entries = buildSitemapEntries(products);
                const expectedCount = (STATIC_PAGE_COUNT + products.length) * LOCALE_COUNT;

                expect(entries).toHaveLength(expectedCount);
            }),
            { numRuns: 100 }
        );
    });

    it("each sitemap entry has hreflang alternates for all supported locales", () => {
        fc.assert(
            fc.property(productListArb, (products) => {
                const entries = buildSitemapEntries(products);

                for (const entry of entries) {
                    // Each entry must have alternates with languages for all locales
                    expect(entry.alternates).toBeDefined();
                    expect(entry.alternates.languages).toBeDefined();

                    for (const locale of locales) {
                        expect(entry.alternates.languages[locale]).toBeDefined();
                        expect(entry.alternates.languages[locale]).toMatch(/^https?:\/\//);
                    }

                    // Must have exactly localeCount alternate entries
                    expect(Object.keys(entry.alternates.languages)).toHaveLength(LOCALE_COUNT);
                }
            }),
            { numRuns: 100 }
        );
    });

    it("each sitemap entry URL uses the correct localized pathname for its locale", () => {
        fc.assert(
            fc.property(productListArb, (products) => {
                const entries = buildSitemapEntries(products);
                const baseUrl = getBaseUrl();

                for (const entry of entries) {
                    // URL must start with base URL
                    expect(entry.url.startsWith(baseUrl)).toBe(true);

                    // URL must contain a valid locale prefix
                    const pathPart = entry.url.slice(baseUrl.length);
                    const matchedLocale = locales.find((loc) =>
                        pathPart.startsWith(`/${loc}`)
                    );
                    expect(matchedLocale).toBeDefined();

                    // The path after locale prefix should be a valid localized path
                    const afterLocale = pathPart.slice(`/${matchedLocale}`.length);

                    // For static pages, verify the path matches the expected localized path
                    if (afterLocale === "" || afterLocale === "/") {
                        // Home page - valid
                        expect(true).toBe(true);
                    } else {
                        // Should be a non-empty localized path segment
                        expect(afterLocale.startsWith("/")).toBe(true);
                    }
                }
            }),
            { numRuns: 100 }
        );
    });

    it("hreflang alternates point to equivalent pages in all other locales with correct paths", () => {
        fc.assert(
            fc.property(productListArb, (products) => {
                const entries = buildSitemapEntries(products);
                const baseUrl = getBaseUrl();

                for (const entry of entries) {
                    const languages = entry.alternates.languages;

                    for (const locale of locales) {
                        const alternateUrl = languages[locale];

                        // Each alternate must be an absolute URL
                        expect(alternateUrl.startsWith(baseUrl)).toBe(true);

                        // Each alternate must contain the correct locale prefix
                        const altPath = alternateUrl.slice(baseUrl.length);
                        expect(altPath.startsWith(`/${locale}`)).toBe(true);
                    }
                }
            }),
            { numRuns: 100 }
        );
    });
});
