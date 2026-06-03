import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { getAlternateLinks, getProductOgImage, getBaseUrl } from "@/lib/seo";
import { locales, defaultLocale, localeToBcp47 } from "@/lib/i18n";
import { routing } from "@/i18n/routing";

/**
 * Feature: seo-full-optimization
 * Property-based tests for SEO utilities
 */

// --- Generators ---

/** Generator for supported locales */
const localeArb = fc.constantFrom(...locales);

/** Generator for route keys from the routing config (static routes without params) */
const staticRouteKeyArb = fc.constantFrom(
    "/",
    "/products",
    "/about",
    "/contact",
    "/cart",
    "/checkout"
);

/** Generator for product IDs (used as route params) */
const productIdArb = fc.integer({ min: 1, max: 9999 }).map(String);

/** Generator for route keys including dynamic routes with params */
const routeWithParamsArb = fc.oneof(
    staticRouteKeyArb.map((key) => ({ key, params: undefined as Record<string, string> | undefined })),
    productIdArb.map((id) => ({ key: "/products/[id]", params: { id } }))
);

/** Generator for non-empty product image arrays */
const productImageArb = fc.record({
    image: fc.oneof(
        // Relative path
        fc.stringMatching(/^\/media\/products\/[a-z0-9_]+\.(jpg|png|webp)$/).filter(s => s.length > 0),
        // Absolute URL
        fc.stringMatching(/^https:\/\/cdn\.example\.com\/[a-z0-9_]+\.(jpg|png|webp)$/).filter(s => s.length > 0)
    ),
});

const productImagesArb = fc.array(productImageArb, { minLength: 1, maxLength: 5 });

/** Generator for product names */
const productNameArb = fc.string({ minLength: 1, maxLength: 100 }).filter(
    (s) => s.trim().length > 0
);

// --- Helper to resolve localized path (mirrors seo.ts logic for verification) ---

function getExpectedLocalizedPath(
    pathnameKey: string,
    locale: string,
    params?: Record<string, string>
): string {
    const pathnameConfig = routing.pathnames[pathnameKey as keyof typeof routing.pathnames];
    if (!pathnameConfig) return pathnameKey;

    let localizedPath: string;
    if (typeof pathnameConfig === "string") {
        localizedPath = pathnameConfig;
    } else {
        localizedPath = (pathnameConfig as Record<string, string>)[locale] || pathnameKey;
    }

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            localizedPath = localizedPath.replace(`[${key}]`, value);
        }
    }

    return localizedPath;
}

// --- Property 1: Canonical URL and hreflang correctness ---

describe("Feature: seo-full-optimization, Property 1: Canonical URL and hreflang correctness", () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3**
     *
     * For any valid route key, any supported locale, and any valid route params,
     * getAlternateLinks shall produce:
     * (a) a canonical URL that starts with the base URL, contains the locale prefix,
     *     and uses the localized pathname for that locale
     * (b) hreflang entries for all three locales (en_US, es_ES, fr_FR) with correctly localized URLs
     * (c) an x-default entry pointing to the English locale version
     */

    it("canonical URL starts with base URL and contains locale prefix with localized pathname", () => {
        fc.assert(
            fc.property(routeWithParamsArb, localeArb, ({ key, params }, locale) => {
                const localizedPath = getExpectedLocalizedPath(key, locale, params);
                const result = getAlternateLinks(localizedPath, locale);
                const baseUrl = getBaseUrl();

                // (a) Canonical starts with base URL
                expect(result.canonical).toMatch(new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));

                // (a) Canonical contains the locale prefix
                expect(result.canonical).toContain(`/${locale}`);

                // (a) Canonical uses the localized pathname for the given locale
                const expectedCanonical = `${baseUrl}/${locale}${localizedPath === "/" ? "" : localizedPath}`;
                expect(result.canonical).toBe(expectedCanonical);
            }),
            { numRuns: 100 }
        );
    });

    it("hreflang entries exist for all three locales with correctly localized URLs", () => {
        fc.assert(
            fc.property(routeWithParamsArb, localeArb, ({ key, params }, locale) => {
                const localizedPath = getExpectedLocalizedPath(key, locale, params);
                const result = getAlternateLinks(localizedPath, locale);
                const baseUrl = getBaseUrl();

                // (b) All three BCP 47 locale keys must be present
                for (const loc of locales) {
                    const bcp47 = localeToBcp47[loc];
                    expect(result.languages).toHaveProperty(bcp47);

                    // Each hreflang URL uses the correctly localized pathname for that locale
                    const expectedPath = getExpectedLocalizedPath(key, loc, params);
                    const expectedUrl = `${baseUrl}/${loc}${expectedPath === "/" ? "" : expectedPath}`;
                    expect(result.languages[bcp47]).toBe(expectedUrl);
                }
            }),
            { numRuns: 100 }
        );
    });

    it("x-default entry points to the English (default) locale version", () => {
        fc.assert(
            fc.property(routeWithParamsArb, localeArb, ({ key, params }, locale) => {
                const localizedPath = getExpectedLocalizedPath(key, locale, params);
                const result = getAlternateLinks(localizedPath, locale);
                const baseUrl = getBaseUrl();

                // (c) x-default must exist and point to the English version
                expect(result.languages).toHaveProperty("x-default");

                const defaultPath = getExpectedLocalizedPath(key, defaultLocale, params);
                const expectedXDefault = `${baseUrl}/${defaultLocale}${defaultPath === "/" ? "" : defaultPath}`;
                expect(result.languages["x-default"]).toBe(expectedXDefault);
            }),
            { numRuns: 100 }
        );
    });
});

// --- Property 7: Product OG image selection ---

describe("Feature: seo-full-optimization, Property 7: Product OG image selection", () => {
    /**
     * **Validates: Requirements 9.2, 9.3**
     *
     * For any product with a non-empty images array, the og:image URL shall match
     * the first image in the array (resolved to absolute URL).
     * For any product with an empty or missing images array, the og:image shall use
     * the default brand image URL.
     */

    it("uses first product image when images array is non-empty", () => {
        fc.assert(
            fc.property(productImagesArb, productNameArb, (images, productName) => {
                const result = getProductOgImage(images, productName);
                const baseUrl = getBaseUrl();
                const firstImage = images[0].image;

                // Should use the first image
                if (firstImage.startsWith("http")) {
                    expect(result.url).toBe(firstImage);
                } else {
                    expect(result.url).toBe(`${baseUrl}${firstImage}`);
                }

                // Should have correct dimensions
                expect(result.width).toBe(1200);
                expect(result.height).toBe(630);

                // Alt text should be the product name
                expect(result.alt).toBe(productName);
            }),
            { numRuns: 100 }
        );
    });

    it("falls back to default brand image when images array is empty", () => {
        fc.assert(
            fc.property(productNameArb, (productName) => {
                const result = getProductOgImage([], productName);
                const baseUrl = getBaseUrl();

                // Should use the default brand image
                expect(result.url).toBe(`${baseUrl}/img/og-default.jpg`);
                expect(result.width).toBe(1200);
                expect(result.height).toBe(630);
                expect(result.alt).toBe("Artesena - Handcrafted Bolivian Instruments");
            }),
            { numRuns: 100 }
        );
    });

    it("falls back to default brand image when images is undefined", () => {
        fc.assert(
            fc.property(productNameArb, (productName) => {
                const result = getProductOgImage(undefined, productName);
                const baseUrl = getBaseUrl();

                // Should use the default brand image
                expect(result.url).toBe(`${baseUrl}/img/og-default.jpg`);
                expect(result.width).toBe(1200);
                expect(result.height).toBe(630);
                expect(result.alt).toBe("Artesena - Handcrafted Bolivian Instruments");
            }),
            { numRuns: 100 }
        );
    });
});
