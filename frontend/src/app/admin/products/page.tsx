"use client";

import { useEffect, useState } from "react";
import CrudTable from "@/components/admin/CrudTable";
import { adminApi } from "@/services/api";

export default function ProductsAdminPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState<{ value: any; label: string }[]>([]);

    const load = () => adminApi.getProducts().then(setItems);

    useEffect(() => {
        load();
        adminApi.getCategories().then((cats: any[]) =>
            setCategories(cats.map((c) => ({ value: c.id, label: c.name })))
        );
    }, []);

    const fields = [
        { key: "name", label: "Nombre" },
        { key: "description", label: "Descripción" },
        { key: "base_price", label: "Precio base", type: "number" as const },
        { key: "category", label: "Categoría", type: "select" as const, options: categories },
    ];

    return (
        <CrudTable
            title="Productos"
            items={items}
            fields={fields}
            onCreate={async (data) => { await adminApi.createProduct(data); load(); }}
            onUpdate={async (id, data) => { await adminApi.updateProduct(id, data); load(); }}
            onDelete={async (id) => { await adminApi.deleteProduct(id); load(); }}
        />
    );
}
