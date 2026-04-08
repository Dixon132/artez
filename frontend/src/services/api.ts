const API_URL = "http://127.0.0.1:8000/api";

export async function getProducts(locale: string) {
    const res = await fetch(`${API_URL}/products?lang=${locale}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error fetching products");
    return res.json();
}

export async function getProduct(id: string, locale: string) {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Error fetching product");
    return res.json();
}

// ── Admin helpers ──────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    if (res.status === 204) return null;
    return res.json();
}

export const adminApi = {
    // Products
    getProducts: () => apiFetch("/products/"),
    createProduct: (data: any) => apiFetch("/products/", { method: "POST", body: JSON.stringify(data) }),
    updateProduct: (id: number, data: any) => apiFetch(`/products/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProduct: (id: number) => apiFetch(`/products/${id}/`, { method: "DELETE" }),

    // Categories
    getCategories: () => apiFetch("/categories/"),
    createCategory: (data: any) => apiFetch("/categories/", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (id: number, data: any) => apiFetch(`/categories/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCategory: (id: number) => apiFetch(`/categories/${id}/`, { method: "DELETE" }),

    // Customers
    getCustomers: () => apiFetch("/customers/"),
    createCustomer: (data: any) => apiFetch("/customers/", { method: "POST", body: JSON.stringify(data) }),
    updateCustomer: (id: number, data: any) => apiFetch(`/customers/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCustomer: (id: number) => apiFetch(`/customers/${id}/`, { method: "DELETE" }),

    // Orders
    getOrders: () => apiFetch("/orders/"),
    createOrder: (data: any) => apiFetch("/orders/", { method: "POST", body: JSON.stringify(data) }),
    updateOrder: (id: number, data: any) => apiFetch(`/orders/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
    deleteOrder: (id: number) => apiFetch(`/orders/${id}/`, { method: "DELETE" }),

    // Carts
    getCarts: () => apiFetch("/carts/"),
    createCart: (data: any) => apiFetch("/carts/", { method: "POST", body: JSON.stringify(data) }),
    updateCart: (id: number, data: any) => apiFetch(`/carts/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCart: (id: number) => apiFetch(`/carts/${id}/`, { method: "DELETE" }),
};
