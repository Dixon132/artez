// Feature: seo-localized-urls, Property 2: Alternate Locale Completeness
// Validates: Requirements 1.4, 3.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getCommonMetadata } from "@/lib/seo";
import { locales, localeToBcp47, type Locale } from "@/lib/i18n";

/**
 * Property 2: Alternate Locale Completeness
 *
 * For any locale, the alternateLocale array returned by getCommonMetadata SHALL:
 * - Contain exactly (totalLocales - 1) entries (i.e., 2 entries for 3 supported locales)
 * - Contain the BCP 47 codes of all other supported locales (excluding the current one)
 * - NOT contain the current locale's BCP 47 code
 */

// Generators
const localeArb = fc.constantFrom(...locales);

describe("Property 2: Alternate Locale Completeness", () => {
    it("alternateLocale array has exactly totalLocales - 1 entries for any locale", () => {
        fc.assert(
            fc.property(localeArb, (locale) => {
                const meta = getCommonMetadata(locale);

                expect(meta.openGraph).toBeDefined();
                expect(meta.openGraph!.alternateLocale).toBeDefined();
                expect(Array.isArray(meta.openGraph!.alternateLocale)).toBe(true);

                // Count must be exactly totalLocales - 1
                const expectedCount = locales.length - 1;
                expect(meta.openGraph!.alternateLocale).toHaveLength(expectedCount);
            }),
            { numRuns: 100 }
        );
    });

    it("alternateLocale contains the BCP 47 codes of all other supported locales", () => {
        fc.assert(
            fc.property(localeArb, (locale) => {
                const meta = getCommonMetadata(locale);
                const alternateLocales = meta.openGraph!.alternateLocale as string[];

                // Get expected BCP 47 codes for all locales except the current one
                const expectedBcp47Codes = locales
                    .filter((loc) => loc !== locale)
                    .map((loc) => localeToBcp47[loc]);

                // Each expected code must be present in the alternateLocale array
                for (const expectedCode of expectedBcp47Codes) {
                    expect(alternateLocales).toContain(expectedCode);
                }
            }),
            { numRuns: 100 }
        );
    });

    it("alternateLocale does NOT contain the current locale's BCP 47 code", () => {
        fc.assert(
            fc.property(localeArb, (locale) => {
                const meta = getCommonMetadata(locale);
                const alternateLocales = meta.openGraph!.alternateLocale as string[];

                // The current locale's BCP 47 code must NOT be in the array
                const currentBcp47 = localeToBcp47[locale as Locale];
                expect(alternateLocales).not.toContain(currentBcp47);
            }),
            { numRuns: 100 }
        );
    });
});
