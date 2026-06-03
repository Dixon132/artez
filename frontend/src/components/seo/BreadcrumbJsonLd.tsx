import { getBaseUrl } from "@/lib/seo";

interface BreadcrumbItem {
    name: string;
    href: string;
}

interface BreadcrumbJsonLdProps {
    items: BreadcrumbItem[];
}

/**
 * Server component that renders JSON-LD structured data for breadcrumb navigation.
 * Outputs a <script type="application/ld+json"> tag with Schema.org BreadcrumbList markup.
 *
 * Validates: Requirements 4.4, 14.3
 */
export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const baseUrl = getBaseUrl();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.href.startsWith("http")
                ? item.href
                : `${baseUrl}${item.href}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
