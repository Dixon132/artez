// Google Analytics
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

/**
 * Guard function that checks if Google Analytics is enabled.
 * Returns false when GA_ID is empty or window.gtag is not available.
 * All event functions are no-ops when this returns false.
 */
export function isGaEnabled(): boolean {
    return Boolean(GA_ID) && typeof window !== "undefined" && typeof window.gtag !== "undefined";
}

// Pageview
export const gaPageview = (url: string) => {
    if (!isGaEnabled()) return;
    window.gtag('config', GA_ID!, {
        page_path: url,
    });
};

// View product - includes item_id, item_name, item_category, price
export const gaViewItem = (product: any) => {
    if (!isGaEnabled()) return;
    window.gtag('event', 'view_item', {
        currency: 'USD',
        value: Number(product.base_price),
        items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.category_name,
            price: Number(product.base_price),
        }]
    });
};

// Add to cart - includes quantity and value
export const gaAddToCart = (product: any, quantity: number, total: number) => {
    if (!isGaEnabled()) return;
    window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: total,
        items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.category_name,
            price: Number(product.base_price),
            quantity: quantity,
        }]
    });
};

// Begin checkout - maps all cart items
export const gaBeginCheckout = (cart: any) => {
    if (!isGaEnabled()) return;
    window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: cart.total,
        items: cart.items.map((item: any) => ({
            item_id: item.product_id,
            item_name: item.product_name,
            price: Number(item.product_price),
            quantity: item.quantity,
        }))
    });
};

// Purchase - includes transaction_id, value, currency, items
export const gaPurchase = (order: any) => {
    if (!isGaEnabled()) return;
    window.gtag('event', 'purchase', {
        transaction_id: String(order.id),
        value: Number(order.total_price),
        currency: 'USD',
        items: order.items.map((item: any) => ({
            item_id: item.product_id,
            item_name: item.product_name,
            price: Number(item.product_price),
            quantity: item.quantity,
        }))
    });
};

// View item list - includes all products with index positions
export const gaViewItemList = (products: any[]) => {
    if (!isGaEnabled()) return;
    window.gtag('event', 'view_item_list', {
        items: products.map((product, index) => ({
            item_id: product.id,
            item_name: product.name,
            item_category: product.category_name,
            price: Number(product.base_price),
            index: index,
        }))
    });
};
