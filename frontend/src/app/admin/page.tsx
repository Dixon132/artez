import Link from "next/link";

const sections = [
    { href: "/admin/products", label: "Productos", icon: "📦", desc: "Gestionar catálogo" },
    { href: "/admin/categories", label: "Categorías", icon: "🗂️", desc: "Organizar productos" },
    { href: "/admin/customers", label: "Clientes", icon: "👥", desc: "Base de clientes" },
    { href: "/admin/orders", label: "Órdenes", icon: "🧾", desc: "Ver pedidos" },
    { href: "/admin/carts", label: "Carritos", icon: "🛒", desc: "Carritos activos" },
];

export default function AdminPage() {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Panel de Administración</h1>
            <p className="text-stone-500 mb-8">Bienvenido a Artesena Admin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.map((s) => (
                    <Link
                        key={s.href}
                        href={s.href}
                        className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all group"
                    >
                        <div className="text-3xl mb-3">{s.icon}</div>
                        <div className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">{s.label}</div>
                        <div className="text-sm text-stone-400 mt-1">{s.desc}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
