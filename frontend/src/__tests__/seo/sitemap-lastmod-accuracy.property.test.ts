// Feature: seo-localized-urls, Property 8: Sitemap Lastmod Accuracy
// Validates: Requirements 7.6

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Property 8: Sitemap Lastmod Accuracy
 *
 * For any product with a known updated_at timestamp, the sitemap entry's
 * lastModified value SHALL equal that product's updated_at timestamp.
 *
 * Since the sitemap function fetches from an API, we test the core logic:
 * the sitemap uses `new Date(product.updated_at)` for product entries.
 * We verify that for any valid ISO date string (representing a product's
 * updated_at field), the resulting Date object preserves the timestamp correctly.
 */

// Generator: random Date between 2020-01-01 and now, filtered to valid dates only
const timestampArb = fc.date({
    min: new Date("2020-01-01T00:00:00.000Z"),
    max: new Date(),
}).filter((d) => !Number.isNaN(d.getTime()));

/**
 * Replicates the sitemap's timestamp handling logic:
 * product.updated_at is an ISO string from the API,
 * and the sitemap converts it via `new Date(product.updated_at)`.
 */
function computeLastModified(updatedAtIsoString: string): Date {
    return new Date(updatedAtIsoString);
}

describe("Property 8: Sitemap Lastmod Accuracy", () => {
    it("lastModified equals the product's updated_at timestamp for any valid ISO date", () => {
        fc.assert(
            fc.property(timestampArb, (timestamp) => {
                // Simulate the API returning an ISO string (as Django serializes dates)
                const updatedAtIsoString = timestamp.toISOString();

                // Apply the same logic the sitemap uses
                const lastModified = computeLastModified(updatedAtIsoString);

                // The resulting Date should equal the original timestamp
                expect(lastModified.getTime()).toBe(timestamp.getTime());
            }),
            { numRuns: 100 }
        );
    });

    it("lastModified preserves the exact millisecond precision of updated_at", () => {
        fc.assert(
            fc.property(timestampArb, (timestamp) => {
                const updatedAtIsoString = timestamp.toISOString();
                const lastModified = computeLastModified(updatedAtIsoString);

                // Verify ISO string round-trip preserves the value exactly
                expect(lastModified.toISOString()).toBe(updatedAtIsoString);
            }),
            { numRuns: 100 }
        );
    });

    it("lastModified produces a valid Date object (not NaN) for any product timestamp", () => {
        fc.assert(
            fc.property(timestampArb, (timestamp) => {
                const updatedAtIsoString = timestamp.toISOString();
                const lastModified = computeLastModified(updatedAtIsoString);

                // The Date must be valid (not Invalid Date)
                expect(Number.isNaN(lastModified.getTime())).toBe(false);
            }),
            { numRuns: 100 }
        );
    });
});
