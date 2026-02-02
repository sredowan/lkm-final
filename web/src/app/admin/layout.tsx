"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    Layers,
    ShoppingCart,
    Settings,
    LogOut,
    Calendar,
    Users,
    CreditCard,
    ChevronRight,
    Tag,
    Truck
} from "lucide-react";
import clsx from "clsx";

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Brands', href: '/admin/brands', icon: Tag },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Shipping', href: '/admin/shipping', icon: Truck },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";

    // All hooks must be called before any conditional returns
    useEffect(() => {
        if (!isLoginPage && status === "unauthenticated") {
            router.push("/admin/login");
        }
    }, [status, router, isLoginPage]);

    // Bypass layout for login page (after all hooks)
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <span className="text-sm text-gray-500">Loading admin panel...</span>
                </div>
            </div>
        );
    }

    if (!session || (session.user as any).role !== 'admin') {
        return null;
    }

    const handleLogout = () => {
        signOut({ callbackUrl: '/admin/login' });
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-800">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">LM</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Lakemba Mobile</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <item.icon className={clsx(
                                    'h-5 w-5 transition-colors',
                                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                                )} />
                                {item.name}
                                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-200" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="border-t border-gray-800 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {session.user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session.user?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
