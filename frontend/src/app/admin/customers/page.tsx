"use client";

import { useEffect, useState } from "react";
import CrudTable from "@/components/admin/CrudTable";
import { adminApi } from "@/services/api";

const fields = [
    { key: "email", label: "Email", type: "email" as const },
    { key: "name", label: "Nombre" },
];

export default function CustomersAdminPage() {
    const [items, setItems] = useState([]);

    const load = () => adminApi.getCustomers().then(setItems);
    useEffect(() => { load(); }, []);

    return (
        <CrudTable
            title="Clientes"
            items={items}
            fields={fields}
            onCreate={async (data) => { await adminApi.createCustomer(data); load(); }}
            onUpdate={async (id, data) => { await adminApi.updateCustomer(id, data); load(); }}
            onDelete={async (id) => { await adminApi.deleteCustomer(id); load(); }}
        />
    );
}
