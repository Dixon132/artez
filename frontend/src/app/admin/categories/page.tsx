"use client";

import { useEffect, useState } from "react";
import CrudTable from "@/components/admin/CrudTable";
import { adminApi } from "@/services/api";

const fields = [{ key: "name", label: "Nombre" }];

export default function CategoriesAdminPage() {
    const [items, setItems] = useState([]);

    const load = () => adminApi.getCategories().then(setItems);
    useEffect(() => { load(); }, []);

    return (
        <CrudTable
            title="Categorías"
            items={items}
            fields={fields}
            onCreate={async (data) => { await adminApi.createCategory(data); load(); }}
            onUpdate={async (id, data) => { await adminApi.updateCategory(id, data); load(); }}
            onDelete={async (id) => { await adminApi.deleteCategory(id); load(); }}
        />
    );
}
