// Meta Pixel (Facebook)
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
    interface Window {
        fbq: any;
    }
}

// Pageview
export const fbPageview = () => {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'PageView');
    }
};

// Ver contenido (producto)
export const fbViewContent = (product: any) => {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'ViewContent', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: Number(product.base_price),
            currency: 'USD'
        });
    }
};

// Agregar al carrito
export const fbAddToCart = (product: any, quantity: number, total: number) => {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: total,
            currency: 'USD',
            quantity: quantity
        });
    }
};

// Iniciar checkout
export const fbInitiateCheckout = (cart: any) => {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'InitiateCheckout', {
            content_ids: cart.items.map((item: any) => item.product_id),
            value: cart.total,
            currency: 'USD',
            num_items: cart.items.length
        });
    }
};

// Compra completada
export const fbPurchase = (order: any) => {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'Purchase', {
            content_ids: order.items.map((item: any) => item.product_id),
            value: Number(order.total_price),
            currency: 'USD',
            num_items: order.items.length
        });
    }
};

// Búsqueda
export const fbSearch = (searchTerm: string) => {
    if (typeof window.fbq !== 'undefined') {
        window.fbq('track', 'Search', {
            search_string: searchTerm
        });
    }
};
