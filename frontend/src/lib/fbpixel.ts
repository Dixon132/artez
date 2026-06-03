// Meta Pixel (Facebook)
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
    interface Window {
        fbq: any;
    }
}

/**
 * Guard function that checks if Meta Pixel is enabled.
 * Returns false when FB_PIXEL_ID is empty or window.fbq is not available.
 */
export function isFbEnabled(): boolean {
    return Boolean(FB_PIXEL_ID) && typeof window !== "undefined" && typeof window.fbq !== "undefined";
}

// Pageview
export const fbPageview = () => {
    if (!isFbEnabled()) return;
    window.fbq('track', 'PageView');
};

// ViewContent — includes content_ids, content_name, value, currency
export const fbViewContent = (product: any) => {
    if (!isFbEnabled()) return;
    window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: Number(product.base_price),
        currency: 'USD'
    });
};

// AddToCart — includes content_ids, content_name, content_type, value, currency, quantity
export const fbAddToCart = (product: any, quantity: number, total: number) => {
    if (!isFbEnabled()) return;
    window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: total,
        currency: 'USD',
        quantity: quantity
    });
};

// InitiateCheckout — includes value and num_items
export const fbInitiateCheckout = (cart: any) => {
    if (!isFbEnabled()) return;
    window.fbq('track', 'InitiateCheckout', {
        content_ids: cart.items.map((item: any) => item.product_id),
        value: cart.total,
        currency: 'USD',
        num_items: cart.items.length
    });
};

// Purchase — includes value and content_ids
export const fbPurchase = (order: any) => {
    if (!isFbEnabled()) return;
    window.fbq('track', 'Purchase', {
        content_ids: order.items.map((item: any) => item.product_id),
        value: Number(order.total_price),
        currency: 'USD',
        num_items: order.items.length
    });
};

// Search
export const fbSearch = (searchTerm: string) => {
    if (!isFbEnabled()) return;
    window.fbq('track', 'Search', {
        search_string: searchTerm
    });
};
