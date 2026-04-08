"use client";

import { useEffect, useState } from "react";
import CrudTable from "@/components/admin/CrudTable";
import { adminApi } from "@/services/api";

const fields = [
    { key: "customer", label: "Cliente ID", type: "number" as const },
    {
        key: "status", label: "Estado", type: "select" as const,
        options: [
            { value: "pending", label: "Pendiente" },
            { value: "processing", label: "Procesando" },
            { value: "shipped", label: "Enviado" },
            { value: "delivered", label: "Entregado" },
            { value: "cancelled", label: "Cancelado" },
        ],
    },
    { key: "total", label: "Total", type: "number" as const },
];

export default function OrdersAdminPage() {
    const [items, setItems] = useState([]);

    const load = () => adminApi.getOrders().then(setItems);
    useEffect(() => { load(); }, []);

    return (
        <CrudTable
            title="Órdenes"
            items={items}
            fields={fields}
            onCreate={async (data) => { await adminApi.createOrder(data); load(); }}
            onUpdate={async (id, data) => { await adminApi.updateOrder(id, data); load(); }}
            onDelete={async (id) => { await adminApi.deleteOrder(id); load(); }}
        />
    );
}
