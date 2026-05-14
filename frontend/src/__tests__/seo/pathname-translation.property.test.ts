// Feature: seo-localized-urls, Property 3: Pathname Translation Preserves Structure
// Validates: Requirements 4.7, 4.8

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAlternateLinks } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";

/**
 * Expected localized pathnames from the routing config for verification.
 * This mirrors the routing config to validate that getAlternateLinks
 * produces correct translations.
 */
const expectedPathnames: Record<string, Record<Locale, string>> = {
    "/": { en: "/", es: "/", fr: "/" },
    "/products": { en: "/products", es: "/productos", fr: "/produits" },
    "/products/[id]": {
        en: "/products/[id]",
        es: "/productos/[id]",
        fr: "/produits/[id]",
    },
    "/cart": { en: "/cart", es: "/carrito", fr: "/panier" },
    "/about": { en: "/about", es: "/nosotros", fr: "/a-propos" },
    "/checkout": { en: "/checkout", es: "/pagar", fr: "/paiement" },
    "/contact": { en: "/contact", es: "/contacto", fr: "/contact" },
};

// Route keys that have dynamic segments
const dynamicRouteKeys = ["/products/[id]"];

// Route keys that are static (no dynamic segments)
const staticRouteKeys = Object.keys(expectedPathnames).filter(
    (key) => !dynamicRouteKeys.includes(key)
);

// Generators
const localeArb = fc.constantFrom(...locales);
const staticPathnameKeyArb = fc.constantFrom(...staticRouteKeys);
const dynamicPathnameKeyArb = fc.constantFrom(...dynamicRouteKeys);
const productIdArb = fc.integer({ min: 1, max: 9999 }).map(String);

describe("Property 3: Pathname Translation Preserves Structure", () => {
    it("static routes: translating any pathname to any locale produces the correct localized segment with locale prefix", () => {
        fc.assert(
            fc.property(
                staticPathnameKeyArb,
                localeArb,
                localeArb,
                (pathnameKey, sourceLocale, targetLocale) => {
                    // Get the concrete source path for the source locale
                    const sourcePath = expectedPathnames[pathnameKey][sourceLocale];

                    // Call getAlternateLinks with the source path and source locale
                    const result = getAlternateLinks(sourcePath, sourceLocale);

                    // Get the BCP47 code for the target locale
                    const targetBcp47 =
                        targetLocale === "en"
                            ? "en_US"
                            : targetLocale === "es"
                                ? "es_ES"
                                : "fr_FR";

                    const targetUrl = result.languages[targetBcp47];

                    // Expected localized path for the target locale
                    const expectedLocalizedPath =
                        expectedPathnames[pathnameKey][targetLocale];
                    const expectedSuffix =
                        expectedLocalizedPath === "/"
                            ? ""
                            : expectedLocalizedPath;

                    // Assert: target locale prefix is prepended
                    expect(targetUrl).toContain(`/${targetLocale}`);

                    // Assert: correct localized path segment is used
                    expect(targetUrl).toMatch(
                        new RegExp(
                            `/${targetLocale}${expectedSuffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`
                        )
                    );
                }
            ),
            { numRuns: 100 }
        );
    });

    it("dynamic routes: translating pathname with product ID preserves dynamic segment values", () => {
        fc.assert(
            fc.property(
                dynamicPathnameKeyArb,
                localeArb,
                localeArb,
                productIdArb,
                (pathnameKey, sourceLocale, targetLocale, productId) => {
                    // Get the concrete source path with the product ID substituted
                    const sourcePattern =
                        expectedPathnames[pathnameKey][sourceLocale];
                    const sourcePath = sourcePattern.replace("[id]", productId);

                    // Call getAlternateLinks with the concrete source path
                    const result = getAlternateLinks(sourcePath, sourceLocale);

                    // Get the BCP47 code for the target locale
                    const targetBcp47 =
                        targetLocale === "en"
                            ? "en_US"
                            : targetLocale === "es"
                                ? "es_ES"
                                : "fr_FR";

                    const targetUrl = result.languages[targetBcp47];

                    // Expected localized path for the target locale with ID
                    const expectedLocalizedPath = expectedPathnames[pathnameKey][
                        targetLocale
                    ].replace("[id]", productId);

                    // Assert: dynamic segment value (product ID) is preserved unchanged
                    expect(targetUrl).toContain(productId);

                    // Assert: target locale prefix is prepended
                    expect(targetUrl).toContain(`/${targetLocale}`);

                    // Assert: correct localized path segment is used
                    expect(targetUrl).toMatch(
                        new RegExp(
                            `/${targetLocale}${expectedLocalizedPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`
                        )
                    );
                }
            ),
            { numRuns: 100 }
        );
    });

    it("all routes: translated pathname always starts with locale prefix", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...Object.keys(expectedPathnames)),
                localeArb,
                localeArb,
                productIdArb,
                (pathnameKey, sourceLocale, targetLocale, productId) => {
                    // Build the concrete source path
                    let sourcePath =
                        expectedPathnames[pathnameKey][sourceLocale];
                    if (pathnameKey.includes("[id]")) {
                        sourcePath = sourcePath.replace("[id]", productId);
                    }

                    // Call getAlternateLinks
                    const result = getAlternateLinks(sourcePath, sourceLocale);

                    // Get the BCP47 code for the target locale
                    const targetBcp47 =
                        targetLocale === "en"
                            ? "en_US"
                            : targetLocale === "es"
                                ? "es_ES"
                                : "fr_FR";

                    const targetUrl = result.languages[targetBcp47];

                    // Parse the URL to get the pathname
                    const url = new URL(targetUrl);
                    const pathParts = url.pathname
                        .split("/")
                        .filter(Boolean);

                    // Assert: first path segment is the target locale
                    expect(pathParts[0]).toBe(targetLocale);
                }
            ),
            { numRuns: 100 }
        );
    });
});
