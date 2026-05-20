import { getBaseUrl } from "@/lib/seo";

interface ProductImage {
    image: string;
}

interface ProductJsonLdProps {
    name: string;
    description: string;
    base_price: number | string;
    images?: ProductImage[];
    sku?: string;
    category?: string;
}

/**
 * Server component that renders JSON-LD structured data for a product.
 * Outputs a <script type="application/ld+json"> tag with Schema.org Product markup.
 *
 * Validates: Requirements 4.1, 4.6
 */
export default function ProductJsonLd({
    name,
    description,
    base_price,
    images,
    sku,
    category,
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

    // Include SKU when available
    if (sku) {
        jsonLd.sku = sku;
    }

    // Include category when available
    if (category) {
        jsonLd.category = category;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
