"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, ShoppingBag, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import servicesData from "@/data/services.json";

export default function Sidebar() {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        "all-categories": true
    });

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

    return (
        <aside className="fixed top-[80px] left-0 h-[calc(100vh-80px)] w-64 bg-white border-r border-gray-100 overflow-y-auto custom-scrollbar hidden lg:flex flex-col z-40 shadow-soft">
            <div className="p-4 space-y-6">

                {/* 1. Main Navigation */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>

                    <Link href="/" className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        isActive("/") && pathname === "/" ? "bg-brand-blue/5 text-brand-blue" : "text-gray-600 hover:bg-gray-50 hover:text-brand-blue"
                    )}>
                        <Home className="h-4 w-4" />
                        Home
                    </Link>

                    <Link href="/services" className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        isActive("/services") ? "bg-brand-blue/5 text-brand-blue" : "text-gray-600 hover:bg-gray-50 hover:text-brand-blue"
                    )}>
                        <Wrench className="h-4 w-4" />
                        Services
                    </Link>

                    <Link href="/shop" className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                        isActive("/shop") ? "bg-brand-blue/5 text-brand-blue" : "text-gray-600 hover:bg-gray-50 hover:text-brand-blue"
                    )}>
                        <ShoppingBag className="h-4 w-4" />
                        Shop
                    </Link>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {/* 2. Categories Tree */}
                <div className="space-y-1">
                    <button
                        onClick={() => toggleMenu("all-categories")}
                        className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-brand-blue transition"
                    >
                        <span>All Categories</span>
                        <ChevronDown className={clsx("h-3 w-3 transition-transform", openMenus["all-categories"] ? "rotate-180" : "")} />
                    </button>

                    <div className={clsx("space-y-1 pl-2 transition-all overflow-hidden", openMenus["all-categories"] ? "max-h-[1000px]" : "max-h-0")}>
                        {/* Using Service Data as basic categories for now, can be replaced with real product categories */}
                        {servicesData.map(service => (
                            <Link
                                key={service.id}
                                href={`/services/${service.slug}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors group"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-yellow transition-colors" />
                                <span className="truncate">{service.title}</span>
                            </Link>
                        ))}

                        {/* Hardcoded Shop Categories Example */}
                        <Link href="/shop/iphone-cases" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors group">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-yellow transition-colors" />
                            <span>iPhone Cases</span>
                        </Link>
                        <Link href="/shop/chargers" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors group">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-yellow transition-colors" />
                            <span>Chargers & Cables</span>
                        </Link>
                        <Link href="/shop/screen-protectors" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-blue transition-colors group">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-yellow transition-colors" />
                            <span>Screen Protectors</span>
                        </Link>
                    </div>
                </div>

                {/* Promo/Extra */}
                <div className="mt-auto pt-6">
                    <div className="bg-gradient-to-br from-brand-blue to-black rounded-2xl p-4 text-white text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="font-serif text-lg font-bold mb-1 relative z-10">Need Repairs?</h4>
                        <p className="text-xs text-white/70 mb-3 relative z-10">Get your device fixed by experts today.</p>
                        <Link href="/contact" className="inline-block w-full py-2 bg-white/10 hover:bg-white text-white hover:text-brand-blue text-xs font-bold rounded-lg transition-all border border-white/20">
                            Book Now
                        </Link>
                    </div>
                </div>

            </div>
        </aside>
    );
}
