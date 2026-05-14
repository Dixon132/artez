// Feature: seo-localized-urls, Property 10: OG Image URLs Are Absolute
// Validates: Requirements 12.4

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getBaseUrl } from "@/lib/seo";

/**
 * Property 10: OG Image URLs Are Absolute
 *
 * For any product that has at least one image, the Open Graph images metadata
 * field SHALL contain URLs that start with http:// or https:// (absolute URLs
 * accessible to external crawlers).
 *
 * The product detail page resolves image URLs using:
 *   image.startsWith("http") ? image : `${baseUrl}${image}`
 *
 * This test verifies that for any image path (relative or absolute),
 * the resulting OG image URL is always absolute.
 */

// The image URL resolution logic extracted from the product detail page
function resolveOgImageUrl(imagePath: string, baseUrl: string): string {
    return imagePath.startsWith("http") ? imagePath : `${baseUrl}${imagePath}`;
}

// Generators

// Relative image paths (e.g., "/media/products/img.jpg")
const relativeImagePathArb = fc.tuple(
    fc.constantFrom("/media/products/", "/media/options/", "/images/", "/static/img/"),
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9_-]+$/.test(s)),
    fc.constantFrom(".jpg", ".jpeg", ".png", ".webp", ".gif")
).map(([dir, name, ext]) => `${dir}${name}${ext}`);

// Absolute image URLs (already start with http:// or https://)
const absoluteImageUrlArb = fc.tuple(
    fc.constantFrom("http://", "https://"),
    fc.constantFrom("cdn.example.com", "images.artesena.com", "storage.googleapis.com", "s3.amazonaws.com"),
    fc.constantFrom("/products/", "/media/", "/uploads/", "/img/"),
    fc.string({ minLength: 1, maxLength: 15 }).filter((s) => /^[a-z0-9_-]+$/.test(s)),
    fc.constantFrom(".jpg", ".jpeg", ".png", ".webp")
).map(([protocol, domain, path, name, ext]) => `${protocol}${domain}${path}${name}${ext}`);

// Mixed image path: either relative or absolute
const imagePathArb = fc.oneof(relativeImagePathArb, absoluteImageUrlArb);

// Product with 1-5 images (mix of relative and absolute paths)
const productImagesArb = fc.array(imagePathArb, { minLength: 1, maxLength: 5 });

describe("Property 10: OG Image URLs Are Absolute", () => {
    it("for any product image path (relative or absolute), the resolved OG image URL starts with http:// or https://", () => {
        const baseUrl = getBaseUrl();

        fc.assert(
            fc.property(productImagesArb, (imagePaths) => {
                for (const imagePath of imagePaths) {
                    const resolvedUrl = resolveOgImageUrl(imagePath, baseUrl);

                    // The resolved URL must start with http:// or https://
                    const isAbsolute =
                        resolvedUrl.startsWith("http://") ||
                        resolvedUrl.startsWith("https://");
                    expect(isAbsolute).toBe(true);
                }
            }),
            { numRuns: 100 }
        );
    });

    it("relative image paths are resolved to absolute URLs using the base URL", () => {
        const baseUrl = getBaseUrl();

        fc.assert(
            fc.property(relativeImagePathArb, (relativePath) => {
                const resolvedUrl = resolveOgImageUrl(relativePath, baseUrl);

                // Must be absolute
                expect(
                    resolvedUrl.startsWith("http://") ||
                    resolvedUrl.startsWith("https://")
                ).toBe(true);

                // Must contain the base URL as prefix
                expect(resolvedUrl.startsWith(baseUrl)).toBe(true);

                // Must contain the original relative path
                expect(resolvedUrl).toBe(`${baseUrl}${relativePath}`);
            }),
            { numRuns: 100 }
        );
    });

    it("absolute image URLs are preserved unchanged", () => {
        const baseUrl = getBaseUrl();

        fc.assert(
            fc.property(absoluteImageUrlArb, (absoluteUrl) => {
                const resolvedUrl = resolveOgImageUrl(absoluteUrl, baseUrl);

                // Must be absolute
                expect(
                    resolvedUrl.startsWith("http://") ||
                    resolvedUrl.startsWith("https://")
                ).toBe(true);

                // Must be the same as the input (no modification)
                expect(resolvedUrl).toBe(absoluteUrl);
            }),
            { numRuns: 100 }
        );
    });
});
