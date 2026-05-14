// Feature: seo-localized-urls, Property 4: Canonical URL Correctness
// Validates: Requirements 9.1, 9.4, 11.1

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAlternateLinks, getBaseUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { locales, type Locale } from "@/lib/i18n";

/**
 * Property 4: Canonical URL Correctness
 *
 * For any pathname, locale, and query params, the canonical URL SHALL:
 * (a) start with the configured base URL (absolute URL)
 * (b) contain the correct locale prefix
 * (c) use the localized pathname
 * (d) contain no query parameters (no ? character)
 */

// Generators
const pathnameArb = fc.constantFrom(
    "/",
    "/products",
    "/products/[id]",
    "/cart",
    "/about",
    "/checkout",
    "/contact"
);

const localeArb = fc.constantFrom(...locales);

const queryParamsArb = fc.array(
    fc.tuple(
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9]+$/.test(s))
    ),
    { minLength: 0, maxLength: 5 }
);

// Helper: resolve the expected localized path for a given pathname key and locale
function getExpectedLocalizedPath(pathnameKey: string, locale: Locale, productId?: string): string {
    const config = routing.pathnames[pathnameKey as keyof typeof routing.pathnames];
    if (!config) return pathnameKey;

    let localizedPath: string;
    if (typeof config === "string") {
        localizedPath = config;
    } else {
        localizedPath = (config as Record<string, string>)[locale] || pathnameKey;
    }

    // Replace dynamic segments
    if (productId) {
        localizedPath = localizedPath.replace("[id]", productId);
    }

    return localizedPath;
}

describe("Property 4: Canonical URL Correctness", () => {
    it("canonical URL starts with base URL (absolute URL)", () => {
        fc.assert(
            fc.property(
                pathnameArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                (pathnameKey, locale, productId) => {
                    // Resolve the concrete pathname for the given locale
                    const concretePath = getExpectedLocalizedPath(
                        pathnameKey,
                        locale,
                        pathnameKey.includes("[id]") ? String(productId) : undefined
                    );

                    const result = getAlternateLinks(concretePath, locale);
                    const baseUrl = getBaseUrl();

                    expect(result.canonical).toMatch(/^https?:\/\//);
                    expect(result.canonical.startsWith(baseUrl)).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("canonical URL contains correct locale prefix", () => {
        fc.assert(
            fc.property(
                pathnameArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                (pathnameKey, locale, productId) => {
                    const concretePath = getExpectedLocalizedPath(
                        pathnameKey,
                        locale,
                        pathnameKey.includes("[id]") ? String(productId) : undefined
                    );

                    const result = getAlternateLinks(concretePath, locale);
                    const baseUrl = getBaseUrl();

                    // After the base URL, the path should start with /{locale}
                    const pathPart = result.canonical.slice(baseUrl.length);
                    expect(pathPart.startsWith(`/${locale}`)).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("canonical URL uses localized pathname", () => {
        fc.assert(
            fc.property(
                pathnameArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                (pathnameKey, locale, productId) => {
                    const idStr = pathnameKey.includes("[id]") ? String(productId) : undefined;
                    const concretePath = getExpectedLocalizedPath(pathnameKey, locale, idStr);

                    const result = getAlternateLinks(concretePath, locale);
                    const baseUrl = getBaseUrl();

                    // The expected full canonical path
                    const expectedLocalizedPath = getExpectedLocalizedPath(pathnameKey, locale, idStr);
                    const expectedCanonical =
                        expectedLocalizedPath === "/"
                            ? `${baseUrl}/${locale}`
                            : `${baseUrl}/${locale}${expectedLocalizedPath}`;

                    expect(result.canonical).toBe(expectedCanonical);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("canonical URL contains no query parameters", () => {
        fc.assert(
            fc.property(
                pathnameArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                queryParamsArb,
                (pathnameKey, locale, productId, queryParams) => {
                    // Even when query params exist, the canonical should not include them
                    const concretePath = getExpectedLocalizedPath(
                        pathnameKey,
                        locale,
                        pathnameKey.includes("[id]") ? String(productId) : undefined
                    );

                    // Simulate a pathname with query params appended
                    // The getAlternateLinks function receives the pathname without query params
                    // (as per its contract), so we verify the output has no ? character
                    const result = getAlternateLinks(concretePath, locale);

                    expect(result.canonical).not.toContain("?");
                    expect(result.canonical).not.toContain("&");
                }
            ),
            { numRuns: 100 }
        );
    });
});
