import { getBaseUrl } from "@/lib/seo";

interface ItemListProduct {
    id: number;
    name: string;
    url: string;
}

interface ItemListJsonLdProps {
    products: ItemListProduct[];
}

/**
 * Server component that renders JSON-LD structured data for a product list.
 * Outputs a <script type="application/ld+json"> tag with Schema.org ItemList markup.
 *
 * Validates: Requirements 4.5
 */
export default function ItemListJsonLd({ products }: ItemListJsonLdProps) {
    const baseUrl = getBaseUrl();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name,
            url: product.url.startsWith("http")
                ? product.url
                : `${baseUrl}${product.url}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
