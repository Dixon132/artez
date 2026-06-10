"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
    { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/admin/products", label: "Productos", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { href: "/admin/categories", label: "Categorías", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { href: "/admin/options", label: "Opciones", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
    { href: "/admin/translations", label: "Traducciones", icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" },
    { href: "/admin/customers", label: "Clientes", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/admin/orders", label: "Órdenes", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { href: "/admin/finance", label: "Finanzas", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { href: "/admin/shipping", label: "Envíos", icon: "M3 10a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" },
    { href: "/admin/coupons", label: "Cupones", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token && pathname !== "/admin/login") {
            router.push("/admin/login");
        } else {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [pathname, router]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Cargando...</div>;

    if (pathname === "/admin/login") {
        return <div className="min-h-screen bg-stone-50 font-sans">{children}</div>;
    }

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
    };

    return (
        <div className="flex min-h-screen bg-[#faf9f8] font-sans">
            <aside className="w-64 bg-[#1a1a1a] flex flex-col shrink-0 overflow-hidden shadow-2xl">
                <div className="px-8 py-8 border-b border-white/10 bg-[#111]">
                    <span className="text-2xl font-serif text-white tracking-wide">Artesena</span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.2em]">Admin Panel</p>
                </div>
                <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto custom-scroll">
                    {links.map((l) => {
                        const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
                                    isActive 
                                    ? "bg-[#C4612E] text-white shadow-lg shadow-[#C4612E]/20" 
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <svg className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={l.icon} />
                                </svg>
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-auto admin-main relative">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#e2ded9]/50 to-transparent pointer-events-none" />
                <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            <style>{`
                /* Global Admin Overrides */
                .admin-main {
                    font-family: 'DM Sans', sans-serif;
                }
                .admin-main h1 {
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 600;
                    color: #111 !important;
                    font-size: 2.5rem !important;
                    letter-spacing: -0.02em;
                }
                .admin-main h2, .admin-main h3 {
                    font-family: 'Cormorant Garamond', serif;
                    color: #111 !important;
                }
                /* Buttons */
                .admin-main button:not(.pdp-qty-btn) {
                    border-radius: 6px !important;
                    transition: all 0.2s ease !important;
                }
                /* Inputs */
                .admin-main input, .admin-main select, .admin-main textarea {
                    border: 1px solid #e2ded9 !important;
                    border-radius: 6px !important;
                    background: #fff !important;
                    color: #333 !important;
                    box-shadow: none !important;
                }
                .admin-main input:focus, .admin-main select:focus, .admin-main textarea:focus {
                    border-color: #111 !important;
                    outline: none !important;
                    box-shadow: 0 0 0 1px #111 !important;
                }
                /* Tables */
                .admin-main table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin-top: 1rem;
                }
                .admin-main th {
                    background: #f5f2ef;
                    color: #555 !important;
                    font-size: 11px !important;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding: 16px 24px !important;
                    font-weight: 600;
                    border-bottom: 1px solid #e2ded9;
                }
                .admin-main th:first-child { border-top-left-radius: 8px; }
                .admin-main th:last-child { border-top-right-radius: 8px; }
                .admin-main td {
                    padding: 16px 24px !important;
                    border-bottom: 1px solid #e8e4df !important;
                    background: #fff;
                    color: #444 !important;
                    font-size: 14px !important;
                }
                /* Card Wrappers */
                .admin-main > div > .bg-white,
                .admin-main .bg-white.rounded-xl {
                    border-radius: 12px !important;
                    border: 1px solid #e8e4df !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
                }
                /* Custom scroll for sidebar */
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
            `}</style>
        </div>
    );
}
