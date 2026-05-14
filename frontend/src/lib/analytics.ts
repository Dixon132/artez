// Google Analytics
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
    interface Window {
        gtag: any;
    }
}

// Pageview
export const gaPageview = (url: string) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_ID, {
            page_path: url,
        });
    }
};

// Ver producto
export const gaViewItem = (product: any) => {
    if (typeof window.gtag !== 'undefined') {
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
    }
};

// Agregar al carrito
export const gaAddToCart = (product: any, quantity: number, total: number) => {
    if (typeof window.gtag !== 'undefined') {
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
    }
};

// Iniciar checkout
export const gaBeginCheckout = (cart: any) => {
    if (typeof window.gtag !== 'undefined') {
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
    }
};

// Compra completada
export const gaPurchase = (order: any) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'purchase', {
            transaction_id: order.id,
            value: Number(order.total_price),
            currency: 'USD',
            items: order.items.map((item: any) => ({
                item_id: item.product_id,
                item_name: item.product_name,
                price: Number(item.product_price),
                quantity: item.quantity,
            }))
        });
    }
};

// Ver lista de productos
export const gaViewItemList = (products: any[]) => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'view_item_list', {
            items: products.map((product, index) => ({
                item_id: product.id,
                item_name: product.name,
                item_category: product.category_name,
                price: Number(product.base_price),
                index: index,
            }))
        });
    }
};
