import { getBaseUrl } from "@/lib/seo";

interface ProductImage {
    image: string;
}

interface ProductJsonLdProps {
    name: string;
    description: string;
    base_price: number | string;
    images?: ProductImage[];
}

/**
 * Server component that renders JSON-LD structured data for a product.
 * Outputs a <script type="application/ld+json"> tag with Schema.org Product markup.
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */
export default function ProductJsonLd({
    name,
    description,
    base_price,
    images,
}: ProductJsonLdProps) {
    const baseUrl = getBaseUrl();

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        brand: {
            "@type": "Brand",
            name: "Artesena",
        },
        offers: {
            "@type": "Offer",
            price: String(base_price),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
    };

    // Only include image array if images exist and are non-empty
    if (images && images.length > 0) {
        jsonLd.image = images.map((img) =>
            img.image.startsWith("http") ? img.image : `${baseUrl}${img.image}`
        );
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
