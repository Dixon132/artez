import Link from "next/link";

const sections = [
    { href: "/admin/products", label: "Productos", desc: "Gestionar catálogo", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { href: "/admin/categories", label: "Categorías", desc: "Organizar productos", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { href: "/admin/options", label: "Opciones", desc: "Configurar opciones", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
    { href: "/admin/translations", label: "Traducciones", desc: "Gestionar idiomas", icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" },
    { href: "/admin/customers", label: "Clientes", desc: "Ver clientes", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/admin/orders", label: "Órdenes", desc: "Ver pedidos", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { href: "/admin/carts", label: "Carritos", desc: "Carritos activos", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
];

export default function AdminPage() {
    return (
        <div className="p-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-800 mb-2">Panel de Administración</h1>
                <p className="text-stone-500">Bienvenido a Artesena Admin</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.map((s) => (
                    <Link
                        key={s.href}
                        href={s.href}
                        className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                            </svg>
                        </div>
                        <div className="font-semibold text-stone-800 group-hover:text-amber-600 transition-colors text-lg mb-1">{s.label}</div>
                        <div className="text-sm text-stone-400">{s.desc}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
