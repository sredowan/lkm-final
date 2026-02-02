"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import FilterBar, { FilterState } from "@/components/shop/FilterBar";
import clsx from "clsx";
import { motion } from "framer-motion";

// Reusing types from ShopClient/FeaturedBrands
type Brand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    isPopular: boolean | null;
};

type Product = {
    id: string;
    name: string;
    price: number;
    image?: string;
    imageUrl?: string;
    primaryImage?: string;
    brand?: string;
    slug?: string;
    condition?: string;
    variants?: any[];
};

interface ProductsViewClientProps {
    initialBrands: Brand[];
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function ProductsViewClient({ initialBrands, searchParams }: ProductsViewClientProps) {
    const router = useRouter();
    const params = useSearchParams();

    // Get initial filters from URL
    const initialBrandParam = params.get("brand") || "";
    const [activeBrandSlug, setActiveBrandSlug] = useState<string>(initialBrandParam);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Advanced Filters State
    const [facets, setFacets] = useState({
        brands: [] as string[],
        conditions: [] as string[],
        storage: [] as string[],
        priceRange: { min: 0, max: 10000 }
    });
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        conditions: [],
        storage: []
    });

    const handleBrandChange = (slug: string) => {
        setActiveBrandSlug(slug);
        const newParams = new URLSearchParams(params.toString());
        if (slug) {
            newParams.set("brand", slug);
        } else {
            newParams.delete("brand");
        }
        router.push(`/products-view?${newParams.toString()}`, { scroll: false });
    };

    const categoryParam = params.get("category");

    // Fetch Facets (Context Aware)
    useEffect(() => {
        const fetchFacets = async () => {
            try {
                let url = '/api/products/facets';
                const queryParams = [];
                if (categoryParam) queryParams.push(`category=${categoryParam}`);
                if (activeBrandSlug) queryParams.push(`brand=${activeBrandSlug}`);

                if (queryParams.length > 0) {
                    url += `?${queryParams.join('&')}`;
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setFacets(data);
                }
            } catch (error) {
                console.error("Failed to fetch facets:", error);
            }
        };
        fetchFacets();
    }, [categoryParam, activeBrandSlug]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/api/products';
                const queryParams = [];
                // Use activeBrandSlug from state or param? Logic uses activeBrandSlug state.
                if (activeBrandSlug) queryParams.push(`brand=${activeBrandSlug}`);
                if (categoryParam) queryParams.push(`category=${categoryParam}`);

                // Add Advanced Filters
                if (activeFilters.minPrice) queryParams.push(`minPrice=${activeFilters.minPrice}`);
                if (activeFilters.maxPrice) queryParams.push(`maxPrice=${activeFilters.maxPrice}`);
                if (activeFilters.conditions.length > 0) queryParams.push(`condition=${activeFilters.conditions.join(',')}`);
                if (activeFilters.storage.length > 0) queryParams.push(`storage=${activeFilters.storage.join(',')}`);

                if (queryParams.length > 0) {
                    url += `?${queryParams.join('&')}`;
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeBrandSlug, categoryParam, activeFilters]);



    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50 pt-[114px]">
            <FilterBar
                facets={facets}
                filters={activeFilters}
                onApply={setActiveFilters}
                activeBrandSlug={activeBrandSlug}
                onBrandChange={handleBrandChange}
            />

            <main className="flex-1">
                {/* Products Grid */}

                {/* Products Grid */}
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-6 flex justify-between items-end">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {activeBrandSlug
                                ? `${initialBrands.find(b => b.slug === activeBrandSlug)?.name || activeBrandSlug} Products`
                                : "All Products"
                            }
                        </h1>
                        <span className="text-sm text-gray-500">
                            {products.length} {products.length === 1 ? 'Item' : 'Items'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 h-[350px] animate-pulse">
                                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    slug={product.slug || product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.primaryImage || product.imageUrl}
                                    brand={product.brand}
                                    condition={product.condition}
                                    variants={product.variants}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                            <p className="text-gray-500">Try changing your filters or check back later.</p>
                        </div>
                    )}
                </div>
            </main>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
