import { getBaseUrl } from "@/lib/seo";

interface WebSiteJsonLdProps {
    baseUrl?: string;
    locale: string;
}

/**
 * Resolves the localized products path for a given locale.
 */
function getLocalizedProductsPath(locale: string): string {
    const paths: Record<string, string> = {
        en: "/products",
        es: "/productos",
        fr: "/produits",
    };
    return paths[locale] || "/products";
}

/**
 * Server component that renders JSON-LD structured data for the WebSite.
 * Outputs a <script type="application/ld+json"> tag with Schema.org WebSite markup
 * including a SearchAction targeting the localized products page.
 *
 * Validates: Requirements 4.3
 */
export default function WebSiteJsonLd({ baseUrl, locale }: WebSiteJsonLdProps) {
    const siteUrl = baseUrl || getBaseUrl();
    const productsPath = getLocalizedProductsPath(locale);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Artesena",
        url: siteUrl,
        potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}/${locale}${productsPath}?q={search_term}`,
            "query-input": "required name=search_term",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
