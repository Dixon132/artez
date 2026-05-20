import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { locales, type Locale } from "@/lib/i18n";
import { routing } from "@/i18n/routing";
import { getBaseUrl } from "@/lib/seo";

/**
 * Feature: seo-full-optimization
 * Property 11: Sitemap product entries with localized URLs and alternates
 *
 * **Validates: Requirements 5.2, 5.6, 5.7**
 *
 * For any active product and any supported locale, the sitemap shall contain an entry
 * whose URL uses the localized pathname for that locale (e.g., `/es/productos/1` not `/es/products/1`),
 * and whose `alternates.languages` object contains entries for all three locales with their
 * respective localized URLs.
 */

// --- Generators ---

/** Generator for supported locales */
const localeArb = fc.constantFrom(...locales);

/** Generator for product IDs (positive integers as strings) */
const productIdArb = fc.integer({ min: 1, max: 99999 }).map(String);

// --- Helper: mirrors sitemap.ts getLocalizedPath logic ---

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

// --- Helper: mirrors sitemap.ts buildAlternates logic ---

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

// --- Expected localized product path segments per locale ---

const expectedProductPathPrefix: Record<Locale, string> = {
    en: "/products/",
    es: "/productos/",
    fr: "/produits/",
};

// --- Property 11 Tests ---

describe("Feature: seo-full-optimization, Property 11: Sitemap product entries with localized URLs and alternates", () => {
    it("product entry URL uses the localized pathname for the given locale (not the internal /products/ path)", () => {
        fc.assert(
            fc.property(productIdArb, localeArb, (productId, locale) => {
                const params = { id: productId };
                const localizedPath = getLocalizedPath("/products/[id]", locale, params);
                const baseUrl = getBaseUrl();
                const url = `${baseUrl}/${locale}${localizedPath}`;

                // The URL must contain the locale-specific product path segment
                const expectedPrefix = expectedProductPathPrefix[locale];
                expect(url).toContain(`/${locale}${expectedPrefix}${productId}`);

                // The URL must NOT use the internal English path for non-English locales
                if (locale !== "en") {
                    expect(url).not.toContain(`/${locale}/products/`);
                }

                // The URL must start with the base URL
                expect(url).toMatch(new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
            }),
            { numRuns: 100 }
        );
    });

    it("product entry alternates contain entries for all three locales with localized URLs", () => {
        fc.assert(
            fc.property(productIdArb, (productId) => {
                const params = { id: productId };
                const alternates = buildAlternates("/products/[id]", params);
                const baseUrl = getBaseUrl();

                // Alternates must have entries for all three locales
                for (const locale of locales) {
                    expect(alternates.languages).toHaveProperty(locale);

                    // Each alternate URL must use the localized pathname for that locale
                    const expectedPrefix = expectedProductPathPrefix[locale];
                    const expectedUrl = `${baseUrl}/${locale}${expectedPrefix}${productId}`;
                    expect(alternates.languages[locale]).toBe(expectedUrl);
                }
            }),
            { numRuns: 100 }
        );
    });

    it("product entry alternate URLs are distinct across locales (different localized paths)", () => {
        fc.assert(
            fc.property(productIdArb, (productId) => {
                const params = { id: productId };
                const alternates = buildAlternates("/products/[id]", params);

                // All three alternate URLs must be different from each other
                const urls = locales.map((locale) => alternates.languages[locale]);
                const uniqueUrls = new Set(urls);
                expect(uniqueUrls.size).toBe(locales.length);
            }),
            { numRuns: 100 }
        );
    });

    it("product entry URL and alternates are consistent (entry URL matches its locale in alternates)", () => {
        fc.assert(
            fc.property(productIdArb, localeArb, (productId, locale) => {
                const params = { id: productId };
                const localizedPath = getLocalizedPath("/products/[id]", locale, params);
                const baseUrl = getBaseUrl();
                const entryUrl = `${baseUrl}/${locale}${localizedPath}`;

                // The alternates for this product should include the entry URL for the same locale
                const alternates = buildAlternates("/products/[id]", params);
                expect(alternates.languages[locale]).toBe(entryUrl);
            }),
            { numRuns: 100 }
        );
    });
});
