"use client";

import { useEffect, useState } from "react";
import CrudTable from "@/components/admin/CrudTable";
import { adminApi } from "@/services/api";

const fields = [
    { key: "customer", label: "Cliente ID", type: "number" as const },
];

export default function CartsAdminPage() {
    const [items, setItems] = useState([]);

    const load = () => adminApi.getCarts().then(setItems);
    useEffect(() => { load(); }, []);

    return (
        <CrudTable
            title="Carritos"
            items={items}
            fields={fields}
            onCreate={async (data) => { await adminApi.createCart(data); load(); }}
            onUpdate={async (id, data) => { await adminApi.updateCart(id, data); load(); }}
            onDelete={async (id) => { await adminApi.deleteCart(id); load(); }}
        />
    );
}
