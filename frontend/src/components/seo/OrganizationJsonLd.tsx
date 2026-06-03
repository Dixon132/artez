import { getBaseUrl } from "@/lib/seo";

/**
 * Server component that renders JSON-LD structured data for the Organization.
 * Outputs a <script type="application/ld+json"> tag with Schema.org Organization markup.
 *
 * Validates: Requirements 4.2
 */
export default function OrganizationJsonLd() {
    const baseUrl = getBaseUrl();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Artesena",
        url: baseUrl,
        logo: `${baseUrl}/img/og-default.jpg`,
        contactPoint: {
            "@type": "ContactPoint",
            email: "contact@artesena.com",
            contactType: "customer service",
            availableLanguage: ["English", "Spanish", "French"],
        },
        sameAs: [
            "https://www.facebook.com/artesena",
            "https://www.instagram.com/artesena",
            "https://twitter.com/artesena",
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
