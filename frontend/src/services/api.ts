export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export const getAbsoluteMediaUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${BACKEND_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
// ==============================
// 🔷 PRODUCTS API
// ==============================

export const productsApi = {
    // Listar productos
    list: async (lang = 'en', page = 1, search = '') => {
        const queryParams = new URLSearchParams({ lang, page: page.toString() });
        if (search) queryParams.append('search', search);
        const res = await fetch(`${API_URL}/products/?${queryParams.toString()}`);
        return res.json();
    },

    // Obtener producto
    get: async (id: number, lang = 'en') => {
        const res = await fetch(`${API_URL}/products/${id}/?lang=${lang}`);
        return res.json();
    },

    // Crear producto
    create: async (data: any) => {
        const res = await fetch(`${API_URL}/products/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Actualizar producto
    update: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/products/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Eliminar producto
    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/products/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },

    // Subir imagen
    uploadImage: async (id: number, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/products/${id}/upload-image/`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    // Eliminar imagen
    deleteImage: async (productId: number, imageId: number) => {
        const res = await fetch(`${API_URL}/products/${productId}/delete-image/${imageId}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },
};

// ==============================
// 🗂️ CATEGORIES API
// ==============================

export const categoriesApi = {
    list: async (lang = 'en', page = 1, search = '') => {
        const queryParams = new URLSearchParams({ lang, page: page.toString() });
        if (search) queryParams.append('search', search);
        const res = await fetch(`${API_URL}/categories/?${queryParams.toString()}`);
        return res.json();
    },

    get: async (id: number, lang = 'en') => {
        const res = await fetch(`${API_URL}/categories/${id}/?lang=${lang}`);
        return res.json();
    },

    create: async (data: any) => {
        const res = await fetch(`${API_URL}/categories/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    update: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/categories/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/categories/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },
};

// ==============================
// 🎛️ OPTIONS API
// ==============================

export const optionsApi = {
    list: async (lang = 'en', page = 1, search = '') => {
        const queryParams = new URLSearchParams({ lang, page: page.toString() });
        if (search) queryParams.append('search', search);
        const res = await fetch(`${API_URL}/options/?${queryParams.toString()}`);
        return res.json();
    },

    get: async (id: number, lang = 'en') => {
        const res = await fetch(`${API_URL}/options/${id}/?lang=${lang}`);
        return res.json();
    },

    create: async (data: any) => {
        const res = await fetch(`${API_URL}/options/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    update: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/options/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/options/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },
};

// ==============================
// 🎚️ OPTION VALUES API
// ==============================

export const optionValuesApi = {
    list: async (lang = 'en', page = 1, search = '') => {
        const queryParams = new URLSearchParams({ lang, page: page.toString() });
        if (search) queryParams.append('search', search);
        const res = await fetch(`${API_URL}/option-values/?${queryParams.toString()}`);
        return res.json();
    },

    get: async (id: number, lang = 'en') => {
        const res = await fetch(`${API_URL}/option-values/${id}/?lang=${lang}`);
        return res.json();
    },

    create: async (data: FormData) => {
        const res = await fetch(`${API_URL}/option-values/`, {
            method: 'POST',
            body: data,
        });
        return res.json();
    },

    update: async (id: number, data: FormData) => {
        const res = await fetch(`${API_URL}/option-values/${id}/`, {
            method: 'PUT',
            body: data,
        });
        return res.json();
    },

    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/option-values/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },
};

// ==============================
// 🛒 CART API
// ==============================

export const cartApi = {
    // Obtener carrito
    get: async (sessionId: string, lang?: string) => {
        const params = lang ? `?lang=${lang}` : '';
        const res = await fetch(`${API_URL}/cart/${sessionId}/${params}`);
        return res.json();
    },

    // Agregar item
    addItem: async (data: {
        session_id: string;
        product_id: number;
        quantity: number;
        options: { option_id: number; value_id: number }[];
    }) => {
        const res = await fetch(`${API_URL}/cart/add-item/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Actualizar cantidad
    updateItem: async (sessionId: string, itemId: number, quantity: number) => {
        const res = await fetch(`${API_URL}/cart/${sessionId}/items/${itemId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        });
        return res.json();
    },

    // Eliminar item
    removeItem: async (sessionId: string, itemId: number) => {
        const res = await fetch(`${API_URL}/cart/${sessionId}/items/${itemId}/`, {
            method: 'DELETE',
        });
        return res.json();
    },

    // Vaciar carrito
    clear: async (sessionId: string) => {
        const res = await fetch(`${API_URL}/cart/${sessionId}/clear/`, {
            method: 'DELETE',
        });
        return res.json();
    },
};

// ==============================
// 📦 ORDERS API
// ==============================

export const ordersApi = {
    // Listar órdenes
    list: async (page = 1, search = '', status = '') => {
        const queryParams = new URLSearchParams({ page: page.toString() });
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        const res = await fetch(`${API_URL}/orders/?${queryParams.toString()}`);
        return res.json();
    },

    // Obtener orden
    get: async (id: number) => {
        const res = await fetch(`${API_URL}/orders/${id}/`);
        return res.json();
    },

    // Crear orden
    create: async (data: {
        session_id: string;
        email: string;
        full_name: string;
        address: string;
        shipping_zone_id?: number | null;
        coupon_code?: string | null;
    }) => {
        const res = await fetch(`${API_URL}/orders/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Actualizar estado
    updateStatus: async (id: number, status: string) => {
        const res = await fetch(`${API_URL}/orders/${id}/update-status/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        return res.json();
    },
};

// ==============================
// 🏦 FINANCE & AUTH API
// ==============================

export const authApi = {
    login: async (credentials: any) => {
        const res = await fetch(`${API_URL}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        return res.json();
    }
};

export const financeApi = {
    list: async (page = 1, type = '', search = '') => {
        const queryParams = new URLSearchParams({ page: page.toString() });
        if (type) queryParams.append('type', type);
        if (search) queryParams.append('search', search);
        const res = await fetch(`${API_URL}/transactions/?${queryParams.toString()}`);
        return res.json();
    },
    summary: async () => {
        const res = await fetch(`${API_URL}/transactions/summary/`);
        return res.json();
    },
    create: async (data: any) => {
        const res = await fetch(`${API_URL}/transactions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/transactions/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },
    chartData: async (period: 'week' | 'month' | 'year' = 'month') => {
        const res = await fetch(`${API_URL}/transactions/chart_data/?period=${period}`);
        return res.json();
    }
};

export const shippingZonesApi = {
    list: async () => {
        const res = await fetch(`${API_URL}/shipping-zones/`);
        return res.json();
    },
    create: async (data: any) => {
        const res = await fetch(`${API_URL}/shipping-zones/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/shipping-zones/${id}/`, { method: 'DELETE' });
        return res.ok;
    }
};

export const couponsApi = {
    list: async (page = 1, search = '') => {
        const queryParams = new URLSearchParams({ page: page.toString() });
        if (search) queryParams.append('search', search);
        const res = await fetch(`${API_URL}/coupons/?${queryParams.toString()}`);
        return res.json();
    },
    generate: async (data: any) => {
        const res = await fetch(`${API_URL}/coupons/generate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    validate: async (code: string) => {
        const res = await fetch(`${API_URL}/coupons/validate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        return res.json();
    },
    delete: async (id: number) => {
        const res = await fetch(`${API_URL}/coupons/${id}/`, { method: 'DELETE' });
        return res.ok;
    }
};

// ==============================
// 🔧 UTILS
// ==============================

// Generar session_id único
export const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
};

// ==============================
// 🌍 TRANSLATIONS API
// ==============================

export const translationsApi = {
    // Product translations
    listProductTranslations: async () => {
        const res = await fetch(`${API_URL}/product-translations/`);
        return res.json();
    },

    createProductTranslation: async (data: any) => {
        const res = await fetch(`${API_URL}/product-translations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateProductTranslation: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/product-translations/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteProductTranslation: async (id: number) => {
        const res = await fetch(`${API_URL}/product-translations/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },

    // Category translations
    listCategoryTranslations: async () => {
        const res = await fetch(`${API_URL}/category-translations/`);
        return res.json();
    },

    createCategoryTranslation: async (data: any) => {
        const res = await fetch(`${API_URL}/category-translations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateCategoryTranslation: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/category-translations/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteCategoryTranslation: async (id: number) => {
        const res = await fetch(`${API_URL}/category-translations/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },

    // Option translations
    listOptionTranslations: async () => {
        const res = await fetch(`${API_URL}/option-translations/`);
        return res.json();
    },

    createOptionTranslation: async (data: any) => {
        const res = await fetch(`${API_URL}/option-translations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateOptionTranslation: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/option-translations/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteOptionTranslation: async (id: number) => {
        const res = await fetch(`${API_URL}/option-translations/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },

    // Option value translations
    listOptionValueTranslations: async () => {
        const res = await fetch(`${API_URL}/option-value-translations/`);
        return res.json();
    },

    createOptionValueTranslation: async (data: any) => {
        const res = await fetch(`${API_URL}/option-value-translations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateOptionValueTranslation: async (id: number, data: any) => {
        const res = await fetch(`${API_URL}/option-value-translations/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteOptionValueTranslation: async (id: number) => {
        const res = await fetch(`${API_URL}/option-value-translations/${id}/`, {
            method: 'DELETE',
        });
        return res.ok;
    },
};
