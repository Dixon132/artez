"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await authApi.login({ username, password });
            if (res.access) {
                localStorage.setItem("admin_token", res.access);
                router.push("/admin");
            } else {
                setError("Credenciales inválidas.");
            }
        } catch (err) {
            setError("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-100 p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-stone-900 tracking-tight">Artesena Admin</h1>
                    <p className="text-stone-500 mt-2">Ingresa tus credenciales para continuar</p>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-stone-900 bg-stone-50 focus:bg-white"
                            placeholder="admin"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-stone-900 bg-stone-50 focus:bg-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold tracking-wide transition-colors shadow-lg shadow-stone-200 disabled:opacity-70"
                    >
                        {loading ? "Iniciando sesión..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
