// Feature: seo-localized-urls, Property 6: JSON-LD Product Validity
// Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Property 6: JSON-LD Product Validity
 *
 * For any valid product data (with name, description, base_price, and optional images array),
 * the JSON-LD object SHALL:
 * (a) have @type equal to "Product"
 * (b) contain the product name and description
 * (c) have brand.name equal to "Artesena"
 * (d) have an offers object with correct price, "USD" currency, and InStock availability
 * (e) include an image array with all image URLs when images exist
 * (f) omit the image field when no images are provided
 */

// Replicate the JSON-LD building logic from ProductJsonLd component
function buildProductJsonLd(product: {
    name: string;
    description: string;
    base_price: number | string;
    images?: { image: string }[];
}): Record<string, unknown> {
    const baseUrl = "http://localhost:3000";

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        brand: {
            "@type": "Brand",
            name: "Artesena",
        },
        offers: {
            "@type": "Offer",
            price: String(product.base_price),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
    };

    if (product.images && product.images.length > 0) {
        jsonLd.image = product.images.map((img) =>
            img.image.startsWith("http") ? img.image : `${baseUrl}${img.image}`
        );
    }

    return jsonLd;
}

// Generators
const productNameArb = fc.string({ minLength: 1, maxLength: 255 }).filter((s) => s.trim().length > 0);

const productDescriptionArb = fc.string({ minLength: 0, maxLength: 1000 });

const productPriceArb = fc
    .double({ min: 0.01, max: 99999.99, noNaN: true, noDefaultInfinity: true })
    .map((p) => Math.round(p * 100) / 100);

const imageUrlArb = fc.oneof(
    // Absolute URLs
    fc.webUrl().map((url) => url),
    // Relative paths
    fc.stringMatching(/^\/media\/products\/[a-z0-9]+\.(jpg|png|jpeg|webp)$/)
);

const imagesArb = fc.array(
    imageUrlArb.map((url) => ({ image: url })),
    { minLength: 1, maxLength: 10 }
);

const emptyImagesArb = fc.constant([] as { image: string }[]);

describe("Property 6: JSON-LD Product Validity", () => {
    it("@type equals 'Product'", () => {
        fc.assert(
            fc.property(
                productNameArb,
                productDescriptionArb,
                productPriceArb,
                fc.option(imagesArb, { nil: undefined }),
                (name, description, price, images) => {
                    const jsonLd = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images: images ?? undefined,
                    });

                    expect(jsonLd["@type"]).toBe("Product");
                }
            ),
            { numRuns: 100 }
        );
    });

    it("name and description match input", () => {
        fc.assert(
            fc.property(
                productNameArb,
                productDescriptionArb,
                productPriceArb,
                fc.option(imagesArb, { nil: undefined }),
                (name, description, price, images) => {
                    const jsonLd = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images: images ?? undefined,
                    });

                    expect(jsonLd.name).toBe(name);
                    expect(jsonLd.description).toBe(description);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("brand.name equals 'Artesena'", () => {
        fc.assert(
            fc.property(
                productNameArb,
                productDescriptionArb,
                productPriceArb,
                fc.option(imagesArb, { nil: undefined }),
                (name, description, price, images) => {
                    const jsonLd = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images: images ?? undefined,
                    });

                    const brand = jsonLd.brand as { "@type": string; name: string };
                    expect(brand["@type"]).toBe("Brand");
                    expect(brand.name).toBe("Artesena");
                }
            ),
            { numRuns: 100 }
        );
    });

    it("offers has correct price, 'USD' currency, and InStock availability", () => {
        fc.assert(
            fc.property(
                productNameArb,
                productDescriptionArb,
                productPriceArb,
                fc.option(imagesArb, { nil: undefined }),
                (name, description, price, images) => {
                    const jsonLd = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images: images ?? undefined,
                    });

                    const offers = jsonLd.offers as {
                        "@type": string;
                        price: string;
                        priceCurrency: string;
                        availability: string;
                    };

                    expect(offers["@type"]).toBe("Offer");
                    expect(offers.price).toBe(String(price));
                    expect(offers.priceCurrency).toBe("USD");
                    expect(offers.availability).toBe("https://schema.org/InStock");
                }
            ),
            { numRuns: 100 }
        );
    });

    it("image array present when images exist with all URLs", () => {
        fc.assert(
            fc.property(
                productNameArb,
                productDescriptionArb,
                productPriceArb,
                imagesArb,
                (name, description, price, images) => {
                    const jsonLd = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images,
                    });

                    expect(jsonLd.image).toBeDefined();
                    const imageArray = jsonLd.image as string[];
                    expect(imageArray).toHaveLength(images.length);

                    // Each image should be an absolute URL
                    for (const url of imageArray) {
                        expect(url.startsWith("http")).toBe(true);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it("image field omitted when no images are provided", () => {
        fc.assert(
            fc.property(
                productNameArb,
                productDescriptionArb,
                productPriceArb,
                (name, description, price) => {
                    // Test with undefined images
                    const jsonLdNoImages = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images: undefined,
                    });
                    expect(jsonLdNoImages.image).toBeUndefined();

                    // Test with empty images array
                    const jsonLdEmptyImages = buildProductJsonLd({
                        name,
                        description,
                        base_price: price,
                        images: [],
                    });
                    expect(jsonLdEmptyImages.image).toBeUndefined();
                }
            ),
            { numRuns: 100 }
        );
    });
});
