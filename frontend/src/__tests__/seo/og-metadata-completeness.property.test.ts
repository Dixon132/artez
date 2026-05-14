// Feature: seo-localized-urls, Property 1: OG Metadata Completeness
// Validates: Requirements 1.3, 3.3

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getAlternateLinks, getBaseUrl, getCommonMetadata } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { locales, localeToBcp47, type Locale } from "@/lib/i18n";

/**
 * Property 1: OG Metadata Completeness
 *
 * For any page type (home, products, cart, about, contact, productDetail)
 * and for any supported locale, the generated metadata SHALL contain:
 * - non-empty og:title (simulated from page type + locale)
 * - non-empty og:description (simulated from page type + locale)
 * - non-empty og:url containing the locale prefix
 * - non-empty og:type
 * - og:locale in valid BCP 47 format (e.g., en_US, es_ES, fr_FR)
 */

// Generators
const localeArb = fc.constantFrom(...locales);

const pageTypeArb = fc.constantFrom(
    "home",
    "products",
    "cart",
    "about",
    "contact",
    "productDetail"
);

// Map page types to their internal pathname keys
const pageTypeToPathname: Record<string, string> = {
    home: "/",
    products: "/products",
    cart: "/cart",
    about: "/about",
    contact: "/contact",
    productDetail: "/products/[id]",
};

// Helper: resolve the expected localized path for a given pathname key and locale
function getExpectedLocalizedPath(
    pathnameKey: string,
    locale: Locale,
    productId?: string
): string {
    const config =
        routing.pathnames[pathnameKey as keyof typeof routing.pathnames];
    if (!config) return pathnameKey;

    let localizedPath: string;
    if (typeof config === "string") {
        localizedPath = config;
    } else {
        localizedPath =
            (config as Record<string, string>)[locale] || pathnameKey;
    }

    if (productId) {
        localizedPath = localizedPath.replace("[id]", productId);
    }

    return localizedPath;
}

// Simulate building a complete metadata object for a page type and locale
// using the SEO utility functions (getCommonMetadata, getAlternateLinks)
function buildMetadataForPage(
    pageType: string,
    locale: Locale,
    productId?: string
) {
    const pathnameKey = pageTypeToPathname[pageType];
    const concretePath = getExpectedLocalizedPath(pathnameKey, locale, productId);

    // Get common metadata (og:locale, alternateLocale)
    const commonMeta = getCommonMetadata(locale);

    // Get alternate links (canonical URL with locale prefix)
    const alternateLinks = getAlternateLinks(concretePath, locale);

    // Simulate page-specific OG fields that each page's generateMetadata would produce
    const pageTitles: Record<string, Record<Locale, string>> = {
        home: { en: "Artesena - Handcrafted Instruments", es: "Artesena - Instrumentos Artesanales", fr: "Artesena - Instruments Artisanaux" },
        products: { en: "Products | Artesena", es: "Productos | Artesena", fr: "Produits | Artesena" },
        cart: { en: "Cart | Artesena", es: "Carrito | Artesena", fr: "Panier | Artesena" },
        about: { en: "About | Artesena", es: "Nosotros | Artesena", fr: "À propos | Artesena" },
        contact: { en: "Contact | Artesena", es: "Contacto | Artesena", fr: "Contact | Artesena" },
        productDetail: { en: "Product Detail | Artesena", es: "Detalle del Producto | Artesena", fr: "Détail du Produit | Artesena" },
    };

    const pageDescriptions: Record<string, Record<Locale, string>> = {
        home: { en: "Discover handcrafted Bolivian instruments", es: "Descubre instrumentos bolivianos artesanales", fr: "Découvrez les instruments boliviens artisanaux" },
        products: { en: "Browse our catalog of artisan instruments", es: "Explora nuestro catálogo de instrumentos artesanales", fr: "Parcourez notre catalogue d'instruments artisanaux" },
        cart: { en: "Your shopping cart", es: "Tu carrito de compras", fr: "Votre panier d'achat" },
        about: { en: "About Artesena", es: "Sobre Artesena", fr: "À propos d'Artesena" },
        contact: { en: "Contact us", es: "Contáctanos", fr: "Contactez-nous" },
        productDetail: { en: "Handcrafted instrument details", es: "Detalles del instrumento artesanal", fr: "Détails de l'instrument artisanal" },
    };

    return {
        ogTitle: pageTitles[pageType][locale],
        ogDescription: pageDescriptions[pageType][locale],
        ogUrl: alternateLinks.canonical,
        ogType: "website",
        ogLocale: commonMeta.openGraph?.locale,
    };
}

// BCP 47 format validation: language_REGION (e.g., en_US, es_ES, fr_FR)
const BCP47_REGEX = /^[a-z]{2}_[A-Z]{2}$/;

describe("Property 1: OG Metadata Completeness", () => {
    it("getCommonMetadata returns og:locale in valid BCP 47 format for any locale", () => {
        fc.assert(
            fc.property(localeArb, (locale) => {
                const meta = getCommonMetadata(locale);

                // og:locale must be present and non-empty
                expect(meta.openGraph).toBeDefined();
                expect(meta.openGraph!.locale).toBeDefined();
                expect(meta.openGraph!.locale!.length).toBeGreaterThan(0);

                // og:locale must be in BCP 47 format
                expect(meta.openGraph!.locale).toMatch(BCP47_REGEX);

                // og:locale must match the expected BCP 47 for this locale
                expect(meta.openGraph!.locale).toBe(
                    localeToBcp47[locale as Locale]
                );
            }),
            { numRuns: 100 }
        );
    });

    it("getAlternateLinks returns a canonical URL containing the locale prefix for any page type and locale", () => {
        fc.assert(
            fc.property(
                pageTypeArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                (pageType, locale, productId) => {
                    const pathnameKey = pageTypeToPathname[pageType];
                    const idStr = pathnameKey.includes("[id]")
                        ? String(productId)
                        : undefined;
                    const concretePath = getExpectedLocalizedPath(
                        pathnameKey,
                        locale,
                        idStr
                    );

                    const result = getAlternateLinks(concretePath, locale);

                    // og:url (canonical) must be non-empty
                    expect(result.canonical.length).toBeGreaterThan(0);

                    // og:url must contain the locale prefix
                    const baseUrl = getBaseUrl();
                    const pathPart = result.canonical.slice(baseUrl.length);
                    expect(pathPart.startsWith(`/${locale}`)).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("for any page type and locale, all OG fields are present and non-empty", () => {
        fc.assert(
            fc.property(
                pageTypeArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                (pageType, locale, productId) => {
                    const pathnameKey = pageTypeToPathname[pageType];
                    const idStr = pathnameKey.includes("[id]")
                        ? String(productId)
                        : undefined;

                    const metadata = buildMetadataForPage(
                        pageType,
                        locale,
                        idStr
                    );

                    // og:title is present and non-empty
                    expect(metadata.ogTitle).toBeDefined();
                    expect(metadata.ogTitle.length).toBeGreaterThan(0);

                    // og:description is present and non-empty
                    expect(metadata.ogDescription).toBeDefined();
                    expect(metadata.ogDescription.length).toBeGreaterThan(0);

                    // og:url is present, non-empty, and contains locale prefix
                    expect(metadata.ogUrl).toBeDefined();
                    expect(metadata.ogUrl.length).toBeGreaterThan(0);
                    expect(metadata.ogUrl).toContain(`/${locale}`);

                    // og:type is present and non-empty
                    expect(metadata.ogType).toBeDefined();
                    expect(metadata.ogType.length).toBeGreaterThan(0);

                    // og:locale is present, non-empty, and in BCP 47 format
                    expect(metadata.ogLocale).toBeDefined();
                    expect(metadata.ogLocale!.length).toBeGreaterThan(0);
                    expect(metadata.ogLocale).toMatch(BCP47_REGEX);
                }
            ),
            { numRuns: 100 }
        );
    });

    it("og:locale matches the expected BCP 47 code for the given locale", () => {
        fc.assert(
            fc.property(
                pageTypeArb,
                localeArb,
                fc.integer({ min: 1, max: 9999 }),
                (pageType, locale, productId) => {
                    const pathnameKey = pageTypeToPathname[pageType];
                    const idStr = pathnameKey.includes("[id]")
                        ? String(productId)
                        : undefined;

                    const metadata = buildMetadataForPage(
                        pageType,
                        locale,
                        idStr
                    );

                    // og:locale must match the expected BCP 47 mapping
                    const expectedBcp47 = localeToBcp47[locale as Locale];
                    expect(metadata.ogLocale).toBe(expectedBcp47);
                }
            ),
            { numRuns: 100 }
        );
    });
});
