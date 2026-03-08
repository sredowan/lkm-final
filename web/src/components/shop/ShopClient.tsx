"use client";

import { useEffect, useState, useCallback } from 'react';
import Header from "@/components/layout/Header";
import ProductCard from "@/components/shop/ProductCard";
import ShopSidebar from "@/components/shop/ShopSidebar";
import StoreHero from "@/components/shop/StoreHero";
import FeaturedBrands from "@/components/shop/FeaturedBrands";
import FeaturedCategories from "@/components/shop/FeaturedCategories";
import { ChevronLeft, ChevronRight, PackageOpen, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type Category = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    children?: Category[];
};

type Product = {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    image?: string;
    imageUrl?: string;
    primaryImage?: string;
    brand?: string;
    slug: string;
    condition?: string;
    variants?: any[];
};

type Brand = { id: number; name: string; slug: string; logo: string | null; isPopular: boolean | null; };

interface ShopClientProps {
    initialBrands: Brand[];
    initialCategories: Category[];
}

const PRODUCTS_PER_PAGE = 20;

// Smart pagination helper — shows max 7 items with ellipsis
function getPaginationItems(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const items: (number | '...')[] = [];
    if (current <= 4) {
        items.push(1, 2, 3, 4, 5, '...', total);
    } else if (current >= total - 3) {
        items.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
        items.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return items;
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-50" />
            <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-3/5" />
                <div className="h-6 bg-gray-100 rounded w-2/5 mt-2" />
            </div>
        </div>
    );
}

export default function ShopClient({ initialBrands, initialCategories }: ShopClientProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeCategoryName, setActiveCategoryName] = useState<string>("");
    const [activeBrandSlug, setActiveBrandSlug] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState("default");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`;
            if (activeCategory) url += `&category=${activeCategory}`;
            if (activeBrandSlug) url += `&brand=${activeBrandSlug}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                let prods: Product[] = data.products || [];
                // Client-side sort
                if (sortBy === "price-asc") prods = [...prods].sort((a, b) => Number(a.price) - Number(b.price));
                else if (sortBy === "price-desc") prods = [...prods].sort((a, b) => Number(b.price) - Number(a.price));
                else if (sortBy === "name") prods = [...prods].sort((a, b) => a.name.localeCompare(b.name));
                setProducts(prods);
                setTotalPages(data.totalPages || 1);
                setTotalCount(data.totalCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, activeCategory, activeBrandSlug, sortBy]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Resolve the active category display name
    useEffect(() => {
        if (!activeCategory) { setActiveCategoryName(""); return; }
        const findName = (cats: Category[], slug: string): string => {
            for (const cat of cats) {
                if (cat.slug === slug) return cat.name;
                if (cat.children) {
                    const found = findName(cat.children, slug);
                    if (found) return found;
                }
            }
            return slug;
        };
        setActiveCategoryName(findName(initialCategories, activeCategory));
    }, [activeCategory, initialCategories]);

    const handleCategoryChange = (slug: string | null) => {
        setActiveCategory(slug);
        setActiveBrandSlug(""); // Clear brand when categorizing
        setCurrentPage(1);
    };

    const handleBrandChange = (slug: string) => {
        setActiveBrandSlug(slug);
        setActiveCategory(null); // Clear category when branching
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        if (typeof page !== 'number') return;
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const startItem = totalCount > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0;
    const endItem = Math.min(currentPage * PRODUCTS_PER_PAGE, totalCount);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            key="drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col lg:hidden"
                        >
                            <div className="flex-1 overflow-y-auto p-5">
                                <ShopSidebar
                                    categories={initialCategories}
                                    activeCategory={activeCategory}
                                    onCategoryChange={handleCategoryChange}
                                    onClose={() => setSidebarOpen(false)}
                                    isMobile={true}
                                />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 pt-[104px] w-full">
                {/* Breadcrumb / page banner */}
                <div className="w-full bg-white border-b border-gray-100">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
                        <span className="hover:text-brand-blue cursor-pointer transition-colors" onClick={() => { handleCategoryChange(null); setActiveBrandSlug(""); }}>Shop</span>
                        {activeBrandSlug && (
                            <>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                <span className="text-gray-900 font-semibold">{activeBrandSlug.charAt(0).toUpperCase() + activeBrandSlug.slice(1).replace('-', ' ')}</span>
                            </>
                        )}
                        {activeCategoryName && !activeBrandSlug && (
                            <>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                <span className="text-gray-900 font-semibold">{activeCategoryName}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Show Landing Page Sections Only if No Category or Brand is Selected on Page 1 */}
                {!activeCategory && !activeBrandSlug && currentPage === 1 && (
                    <div className="mb-8">
                        {/* 1. Main Hero Slider */}
                        <StoreHero />

                        {/* 2. Featured Categories */}
                        <FeaturedCategories />

                        {/* 3. Shop by Brands (Interactive Tabs) */}
                        <FeaturedBrands
                            brands={initialBrands}
                            activeBrandSlug={activeBrandSlug}
                            onBrandChange={handleBrandChange}
                        />
                    </div>
                )}

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex gap-6 lg:gap-8 items-start">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0">
                            <div className="sticky top-[110px] bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar">
                                <ShopSidebar
                                    categories={initialCategories}
                                    activeCategory={activeCategory}
                                    onCategoryChange={handleCategoryChange}
                                />
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                <div className="flex items-center gap-3">
                                    {/* Mobile filter toggle */}
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="lg:hidden flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-brand-blue hover:text-brand-blue transition-all shadow-sm"
                                    >
                                        <SlidersHorizontal className="w-4 h-4" />
                                        Filter
                                        {activeCategory && <span className="w-2 h-2 bg-brand-blue rounded-full" />}
                                    </button>

                                    {/* Active category pill */}
                                    <AnimatePresence>
                                        {activeCategory && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => handleCategoryChange(null)}
                                                className="flex items-center gap-1.5 h-10 px-4 bg-blue-50 text-brand-blue rounded-xl text-sm font-semibold border border-blue-200 hover:bg-blue-100 transition-all"
                                            >
                                                {activeCategoryName}
                                                <X className="w-3.5 h-3.5" />
                                            </motion.button>
                                        )}
                                        {activeBrandSlug && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => handleBrandChange("")}
                                                className="flex items-center gap-1.5 h-10 px-4 bg-yellow-50 text-brand-yellow rounded-xl text-sm font-semibold border border-yellow-200 hover:bg-yellow-100 transition-all"
                                            >
                                                Brand: {activeBrandSlug.replace('-', ' ')}
                                                <X className="w-3.5 h-3.5" />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>

                                    <span className="text-sm text-gray-500 hidden sm:block">
                                        {loading ? "Loading..." : `${totalCount} product${totalCount !== 1 ? 's' : ''}`}
                                    </span>
                                </div>

                                {/* Sort */}
                                <div className="relative flex-shrink-0">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                        className="h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none hover:border-brand-blue focus:border-brand-blue focus:ring-2 focus:ring-blue-50 transition-all appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="default">Sort: Default</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="name">Name: A–Z</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Product Count (mobile) */}
                            <p className="sm:hidden text-sm text-gray-500 mb-4">
                                {loading ? "Loading..." : `${totalCount} product${totalCount !== 1 ? 's' : ''}`}
                                {totalCount > 0 && !loading && ` · Showing ${startItem}–${endItem}`}
                            </p>

                            {/* Products Grid */}
                            <div className="relative min-h-[320px]">
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <motion.div
                                            key="skeleton"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                                        >
                                            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                                        </motion.div>
                                    ) : products.length > 0 ? (
                                        <motion.div
                                            key={`grid-${currentPage}-${activeCategory}`}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                                        >
                                            {products.map((product, idx) => (
                                                <motion.div
                                                    key={product.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                                                >
                                                    <ProductCard
                                                        id={product.id}
                                                        slug={product.slug}
                                                        name={product.name}
                                                        price={product.price}
                                                        image={product.primaryImage || product.imageUrl}
                                                        brand={product.brand}
                                                        condition={product.condition}
                                                        variants={product.variants}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center"
                                        >
                                            <PackageOpen className="w-14 h-14 text-gray-200 mb-4" strokeWidth={1.5} />
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                                            <p className="text-gray-500 text-sm max-w-xs">
                                                {activeCategory
                                                    ? "Try a different category or clear the filter."
                                                    : "No products are available right now. Check back later!"}
                                            </p>
                                            {activeCategory && (
                                                <button
                                                    onClick={() => handleCategoryChange(null)}
                                                    className="mt-5 px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                                                >
                                                    Clear Filter
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-10 flex flex-col items-center gap-4"
                                >
                                    {/* Page info */}
                                    <p className="text-sm text-gray-500">
                                        Showing <span className="font-semibold text-gray-800">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-800">{totalCount}</span> results
                                    </p>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all shadow-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {getPaginationItems(currentPage, totalPages).map((item, i) =>
                                            item === '...' ? (
                                                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    onClick={() => handlePageChange(item as number)}
                                                    className={clsx(
                                                        "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm",
                                                        currentPage === item
                                                            ? "bg-brand-blue text-white shadow-blue-200"
                                                            : "bg-white border border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue"
                                                    )}
                                                >
                                                    {item}
                                                </button>
                                            )
                                        )}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all shadow-sm"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
