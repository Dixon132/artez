import Link from "next/link";

const links = [
    { href: "/admin", label: "🏠 Dashboard" },
    { href: "/admin/products", label: "📦 Productos" },
    { href: "/admin/categories", label: "🗂️ Categorías" },
    { href: "/admin/customers", label: "👥 Clientes" },
    { href: "/admin/orders", label: "🧾 Órdenes" },
    { href: "/admin/carts", label: "🛒 Carritos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-amber-50 font-sans">
            <aside className="w-56 bg-stone-900 text-stone-100 flex flex-col shrink-0">
                <div className="px-6 py-6 border-b border-stone-700">
                    <span className="text-lg font-bold tracking-wide text-amber-400">Artesena</span>
                    <p className="text-xs text-stone-400 mt-0.5">Panel Admin</p>
                </div>
                <nav className="flex flex-col gap-1 p-3 flex-1">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="px-4 py-2.5 rounded-lg text-sm text-stone-300 hover:bg-stone-700 hover:text-amber-400 transition-colors"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
