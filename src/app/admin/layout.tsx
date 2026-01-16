"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { LayoutDashboard, ShoppingBag, Layers, ShoppingCart, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [status, router]);

    if (status === "loading") return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!session || (session.user as any).role !== 'admin') {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-brand-blue">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Lakemba Mobile King</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center rounded px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-brand-blue">
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/products" className="flex items-center rounded px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-brand-blue">
                        <ShoppingBag className="mr-3 h-5 w-5" />
                        Products
                    </Link>
                    <Link href="/admin/categories" className="flex items-center rounded px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-brand-blue">
                        <Layers className="mr-3 h-5 w-5" />
                        Categories
                    </Link>
                    <Link href="/admin/orders" className="flex items-center rounded px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-brand-blue">
                        <ShoppingCart className="mr-3 h-5 w-5" />
                        Orders
                    </Link>
                    <Link href="/admin/settings" className="flex items-center rounded px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-brand-blue">
                        <Settings className="mr-3 h-5 w-5" />
                        Settings
                    </Link>
                    <button onClick={() => router.push('/api/auth/signout')} className="flex w-full items-center rounded px-4 py-2 text-left text-red-600 hover:bg-red-50">
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
