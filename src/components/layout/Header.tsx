"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, Phone, ChevronDown, X, Facebook, Instagram } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import brandsData from "@/data/brands.json";
import servicesData from "@/data/services.json";
import { useCart } from "@/context/CartContext";
import clsx from "clsx";

// Custom TikTok Icon since it's not in Lucide
const TikTok = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height="1em"
        width="1em"
        className={className}
    >
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
);

export default function Header({ className = '' }: { className?: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRepairOpen, setIsRepairOpen] = useState(false);
    const [isBrandsOpen, setIsBrandsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const pathname = usePathname();
    const isHome = pathname === '/';

    const navRef = useRef<HTMLDivElement>(null);
    const { items } = useCart();

    const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Header transparency logic
    // Transparent only on Home, when at top.
    // Otherwise white.
    const isTransparent = isHome && !isScrolled;

    return (
        <header className={clsx(
            className,
            "fixed w-full z-50 transition-all duration-300"
        )}>
            {/* Top Bar - Always standard colors but maybe transparent bg if desired? Usually distinct. Keeping blue per request/design consistency but can be integrated.
               User request: "need transparent header in hero section". Usually implies the NAV bar. Top bar sits above.
               If Top bar exists, it pushes nav down.
               Let's make Top Bar bg-brand-blue but Nav Bar transparent.
            */}
            <div className="bg-brand-blue text-white py-2 text-xs md:text-sm relative z-50 border-b border-brand-blue/10">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    {/* Left: Phone & Open Info */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <a href="tel:0410807546" className="flex items-center hover:text-brand-yellow transition font-medium">
                            <Phone className="h-3 w-3 mr-2" />
                            0410 807 546
                        </a>
                        <span className="hidden sm:flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Open 7 Days
                        </span>
                    </div>

                    {/* Right: Social Icons */}
                    <div className="flex items-center gap-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition">
                            <Facebook className="h-4 w-4" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition">
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition">
                            <TikTok className="h-4 w-4" />
                        </a>
                        <Link href="/admin/login" className="hidden md:ml-4 md:inline-block hover:text-brand-yellow transition opacity-80 text-xs">Admin</Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className={clsx(
                "w-full transition-all duration-300 border-b",
                isTransparent
                    ? "bg-transparent border-transparent py-4 backdrop-blur-sm"
                    : "bg-white/95 backdrop-blur-md border-gray-100 py-3 shadow-sm"
            )}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <div className="flex flex-col">
                                <span className={clsx(
                                    "text-2xl font-bold uppercase leading-none transition-colors",
                                    isTransparent ? "text-white" : "text-brand-blue"
                                )}>
                                    Lakemba
                                </span>
                                <span className="text-sm font-bold text-brand-yellow uppercase tracking-widest leading-none">Mobile King</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className={clsx(
                            "hidden lg:flex items-center space-x-8 font-medium transition-colors",
                            isTransparent ? "text-white/90" : "text-gray-700"
                        )}>
                            <Link href="/services" className="hover:text-brand-yellow transition">Services</Link>

                            {/* Brands Dropdown */}
                            <div className="group relative">
                                <button className="flex items-center py-2 hover:text-brand-yellow focus:outline-none transition gap-1">
                                    Brands <ChevronDown className="h-4 w-4" />
                                </button>
                                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top w-56">
                                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 text-gray-800">
                                        <ul className="space-y-2">
                                            {brandsData.map((brand) => (
                                                <li key={brand.id}>
                                                    <Link href={`/brands/${brand.slug}`} className="block hover:text-brand-blue hover:translate-x-1 transition-transform">
                                                        {brand.name} Repairs
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Repair Mega Menu */}
                            <div className="group relative">
                                <button className="flex items-center py-2 hover:text-brand-yellow focus:outline-none transition gap-1">
                                    Repair <ChevronDown className="h-4 w-4" />
                                </button>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top w-[300px]">
                                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 text-gray-800">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Services</h3>
                                        <ul className="space-y-2">
                                            {servicesData.map((service) => (
                                                <li key={service.id}>
                                                    <Link href={`/services/${service.slug}`} className="block hover:text-brand-blue hover:translate-x-1 transition-transform">
                                                        {service.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <Link href="/contact" className="hover:text-brand-yellow transition">Contact Us</Link>
                        </nav>

                        {/* Right Side Icons & CTA */}
                        <div className="flex items-center space-x-4">
                            {/* Search (Compact) */}
                            <div className="hidden xl:flex relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className={clsx(
                                        "w-48 border rounded-full py-1.5 px-4 text-sm focus:outline-none focus:border-brand-blue transition",
                                        isTransparent
                                            ? "bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white focus:text-gray-900"
                                            : "bg-gray-50 border-gray-200 focus:bg-white"
                                    )}
                                />
                                <Search className={clsx("h-4 w-4 absolute right-3 top-2", isTransparent ? "text-white/60" : "text-gray-400")} />
                            </div>

                            <Link href="/cart" className={clsx("relative hover:text-brand-yellow transition", isTransparent ? "text-white" : "text-gray-700")}>
                                <ShoppingCart className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-blue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/shop"
                                className="hidden md:inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-bold rounded-full shadow-lg text-brand-blue bg-brand-yellow hover:bg-white hover:scale-105 transition-all"
                            >
                                Online Store
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                className={clsx("lg:hidden p-1 transition-colors", isTransparent ? "text-white" : "text-gray-700")}
                                onClick={toggleMenu}
                            >
                                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`lg:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-screen opacity-100 shadow-xl' : 'max-h-0 opacity-0'}`}>
                <div className="container mx-auto px-4 py-4 space-y-4 font-medium">
                    {/* Search Mobile */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full border border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:border-brand-blue bg-gray-50 text-gray-900"
                        />
                        <Search className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />
                    </div>

                    <div className="space-y-1">
                        <div>
                            <button
                                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                                className="flex items-center justify-between w-full py-3 text-lg text-gray-800 border-b border-gray-100"
                            >
                                Brands <ChevronDown className={`h-5 w-5 transition-transform ${isBrandsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`pl-4 bg-gray-50 rounded-b-lg space-y-3 overflow-hidden transition-all duration-300 ${isBrandsOpen ? 'max-h-[400px] py-4' : 'max-h-0'}`}>
                                <ul className="space-y-3">
                                    {brandsData.map((brand) => (
                                        <li key={brand.id}>
                                            <Link href={`/brands/${brand.slug}`} className="block text-gray-600" onClick={toggleMenu}>
                                                {brand.name} Repairs
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={() => setIsRepairOpen(!isRepairOpen)}
                                className="flex items-center justify-between w-full py-3 text-lg text-gray-800 border-b border-gray-100"
                            >
                                Services <ChevronDown className={`h-5 w-5 transition-transform ${isRepairOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`pl-4 bg-gray-50 rounded-b-lg space-y-3 overflow-hidden transition-all duration-300 ${isRepairOpen ? 'max-h-[400px] py-4' : 'max-h-0'}`}>
                                <ul className="space-y-3">
                                    {servicesData.map((service) => (
                                        <li key={service.id}>
                                            <Link href={`/services/${service.slug}`} className="block text-gray-600" onClick={toggleMenu}>
                                                {service.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <Link href="/contact" className="block py-3 text-lg text-gray-800 border-b border-gray-100" onClick={toggleMenu}>
                            Contact Us
                        </Link>
                        <Link href="/shop" className="block py-3 text-lg text-brand-blue" onClick={toggleMenu}>
                            Online Store
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
