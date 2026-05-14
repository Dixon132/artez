// Feature: seo-localized-urls, Property 5: Hreflang Completeness
// Validates: Requirements 9.2, 9.3, 11.2

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAlternateLinks, getBaseUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { locales, defaultLocale, localeToBcp47, type Locale } from "@/lib/i18n";

/**
 * Property 5: Hreflang Completeness
 *
 * For any pathname, the hreflang set contains one entry per locale
 * with correct localized pathname plus x-default pointing to English version.
 */
describe("Property 5: Hreflang Completeness", () => {
    // Generator: random pathname key from routing config
    const pathnameKeyArb = fc.constantFrom(
        ...Object.keys(routing.pathnames) as string[]
    );

    // Generator: random locale from supported locales
    const localeArb = fc.constantFrom(...locales);

    // Generator: random product ID for dynamic routes
    const productIdArb = fc.integer({ min: 1, max: 9999 }).map(String);

    // Helper: resolve a concrete pathname from a key and locale
    function resolvePathForLocale(
        pathnameKey: string,
        locale: Locale,
        params?: Record<string, string>
    ): string {
        const config = routing.pathnames[pathnameKey as keyof typeof routing.pathnames];
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

    it("hreflang set contains exactly 3 locale entries + 1 x-default = 4 total entries", () => {
        fc.assert(
            fc.property(
                pathnameKeyArb,
                localeArb,
                productIdArb,
                (pathnameKey, locale, productId) => {
                    // Build a concrete pathname for the given locale
                    const hasDynamicSegment = pathnameKey.includes("[id]");
                    const params = hasDynamicSegment ? { id: productId } : undefined;
                    const concretePath = resolvePathForLocale(pathnameKey, locale, params);

                    const result = getAlternateLinks(concretePath, locale);

                    // Should have entries for en_US, es_ES, fr_FR, and x-default
                    const languageKeys = Object.keys(result.languages);
                    expect(languageKeys).toHaveLength(4);

                    // Verify all expected keys are present
                    const expectedKeys = [
                        ...locales.map((l) => localeToBcp47[l]),
                        "x-default",
                    ];
                    expect(languageKeys.sort()).toEqual(expectedKeys.sort());
                }
            ),
            { numRuns: 100 }
        );
    });

    it("each locale entry uses the correct localized pathname for that locale", () => {
        fc.assert(
            fc.property(
                pathnameKeyArb,
                localeArb,
                productIdArb,
                (pathnameKey, locale, productId) => {
                    const hasDynamicSegment = pathnameKey.includes("[id]");
                    const params = hasDynamicSegment ? { id: productId } : undefined;
                    const concretePath = resolvePathForLocale(pathnameKey, locale, params);
                    const baseUrl = getBaseUrl();

                    const result = getAlternateLinks(concretePath, locale);

                    // Verify each locale entry has the correct localized pathname
                    for (const loc of locales) {
                        const bcp47 = localeToBcp47[loc];
                        const expectedPath = resolvePathForLocale(pathnameKey, loc, params);
                        const expectedUrl =
                            expectedPath === "/"
                                ? `${baseUrl}/${loc}`
                                : `${baseUrl}/${loc}${expectedPath}`;

                        expect(result.languages[bcp47]).toBe(expectedUrl);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it("x-default points to the English (default locale) version", () => {
        fc.assert(
            fc.property(
                pathnameKeyArb,
                localeArb,
                productIdArb,
                (pathnameKey, locale, productId) => {
                    const hasDynamicSegment = pathnameKey.includes("[id]");
                    const params = hasDynamicSegment ? { id: productId } : undefined;
                    const concretePath = resolvePathForLocale(pathnameKey, locale, params);
                    const baseUrl = getBaseUrl();

                    const result = getAlternateLinks(concretePath, locale);

                    // x-default should point to the English version
                    const englishPath = resolvePathForLocale(pathnameKey, defaultLocale, params);
                    const expectedXDefault =
                        englishPath === "/"
                            ? `${baseUrl}/${defaultLocale}`
                            : `${baseUrl}/${defaultLocale}${englishPath}`;

                    expect(result.languages["x-default"]).toBe(expectedXDefault);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("all hreflang URLs are absolute (start with base URL)", () => {
        fc.assert(
            fc.property(
                pathnameKeyArb,
                localeArb,
                productIdArb,
                (pathnameKey, locale, productId) => {
                    const hasDynamicSegment = pathnameKey.includes("[id]");
                    const params = hasDynamicSegment ? { id: productId } : undefined;
                    const concretePath = resolvePathForLocale(pathnameKey, locale, params);
                    const baseUrl = getBaseUrl();

                    const result = getAlternateLinks(concretePath, locale);

                    // All URLs in languages should start with the base URL
                    for (const url of Object.values(result.languages)) {
                        expect(url.startsWith(baseUrl)).toBe(true);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
