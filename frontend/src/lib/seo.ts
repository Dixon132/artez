import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { locales, defaultLocale, localeToBcp47, type Locale } from "@/lib/i18n";

export interface AlternateLinks {
    canonical: string;
    languages: Record<string, string>;
}

export interface OgImageConfig {
    url: string;
    width: number;
    height: number;
    alt: string;
}

/**
 * Returns the base URL for canonical links and sitemap entries.
 * Uses NEXT_PUBLIC_BASE_URL env var or falls back to localhost.
 */
export function getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

/**
 * Resolves the localized pathname for a given internal pathname and locale.
 */
function resolveLocalizedPath(
    pathname: string,
    locale: Locale,
    params?: Record<string, string>
): string {
    const pathnameConfig = routing.pathnames[pathname as keyof typeof routing.pathnames];

    if (!pathnameConfig) {
        return pathname;
    }

    let localizedPath: string;

    if (typeof pathnameConfig === "string") {
        localizedPath = pathnameConfig;
    } else {
        localizedPath = (pathnameConfig as Record<string, string>)[locale] || pathname;
    }

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            localizedPath = localizedPath.replace(`[${key}]`, value);
        }
    }

    return localizedPath;
}

/**
 * Determines the internal pathname key from a concrete pathname.
 */
function findPathnameKey(
    concretePath: string,
    locale: Locale
): { key: string; params?: Record<string, string> } | null {
    for (const [key, config] of Object.entries(routing.pathnames)) {
        const pattern =
            typeof config === "string"
                ? config
                : (config as Record<string, string>)[locale] || key;

        const paramNames: string[] = [];
        const regexStr = pattern.replace(/\[(\w+)\]/g, (_match, paramName) => {
            paramNames.push(paramName);
            return "([^/]+)";
        });

        const regex = new RegExp(`^${regexStr}$`);
        const match = concretePath.match(regex);

        if (match) {
            if (paramNames.length > 0) {
                const params: Record<string, string> = {};
                paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                return { key, params };
            }
            return { key };
        }
    }
    return null;
}

/**
 * Generates canonical URL and hreflang alternate links for a given pathname and locale.
 */
export function getAlternateLinks(
    pathname: string,
    locale: string
): AlternateLinks {
    const baseUrl = getBaseUrl();
    const currentLocale = locale as Locale;

    const found = findPathnameKey(pathname, currentLocale);
    const pathnameKey = found?.key || pathname;
    const params = found?.params;

    const localizedPath = resolveLocalizedPath(pathnameKey, currentLocale, params);
    const canonical = `${baseUrl}/${locale}${localizedPath === "/" ? "" : localizedPath}`;

    const languages: Record<string, string> = {};

    for (const loc of locales) {
        const locPath = resolveLocalizedPath(pathnameKey, loc, params);
        const bcp47 = localeToBcp47[loc];
        languages[bcp47] = `${baseUrl}/${loc}${locPath === "/" ? "" : locPath}`;
    }

    const defaultPath = resolveLocalizedPath(pathnameKey, defaultLocale, params);
    languages["x-default"] = `${baseUrl}/${defaultLocale}${defaultPath === "/" ? "" : defaultPath}`;

    return { canonical, languages };
}

/**
 * Returns common metadata fields shared across pages.
 */
export function getCommonMetadata(locale: string): Partial<Metadata> {
    const currentBcp47 = localeToBcp47[locale as Locale];

    const alternateLocales = locales
        .filter((loc) => loc !== locale)
        .map((loc) => localeToBcp47[loc]);

    return {
        openGraph: {
            locale: currentBcp47,
            alternateLocale: alternateLocales,
        },
    };
}

/**
 * Returns the default OG image configuration for pages without specific images.
 */
export function getDefaultOgImage(): OgImageConfig {
    const baseUrl = getBaseUrl();
    return {
        url: `${baseUrl}/img/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Artesena - Handcrafted Bolivian Instruments",
    };
}

/**
 * Returns the OG image config for a product, falling back to default.
 * Uses the first product image if available, otherwise returns the default brand image.
 */
export function getProductOgImage(
    images: Array<{ image: string }> | undefined,
    productName: string
): OgImageConfig {
    const baseUrl = getBaseUrl();
    if (images && images.length > 0) {
        const imageUrl = images[0].image.startsWith("http")
            ? images[0].image
            : `${baseUrl}${images[0].image}`;
        return {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: productName,
        };
    }
    return getDefaultOgImage();
}

/**
 * Truncates text to a maximum length with ellipsis.
 * Returns empty string for falsy input.
 */
export function truncate(text: string, maxLength: number): string {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
}
