"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { Search, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Product = {
    id: string;
    name: string;
    price: number;
    primaryImage?: string;
    brand?: string;
    slug: string;
    condition?: string;
    variants?: any[];
};

export default function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);

    // Filters
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('all');

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            try {
                let url = `/api/products?search=${encodeURIComponent(query)}`;
                if (minPrice) url += `&minPrice=${minPrice}`;
                if (maxPrice) url += `&maxPrice=${maxPrice}`;
                if (selectedBrand !== 'all') url += `&brand=${selectedBrand}`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch search results:", error);
            } finally {
                setLoading(false);
            }
        }

        const timeoutId = setTimeout(fetchResults, 300); // Small debounce
        return () => clearTimeout(timeoutId);
    }, [query, minPrice, maxPrice, selectedBrand]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {query ? `Search results for "${query}"` : "All Products"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors md:hidden"
                >
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className={clsx(
                    "lg:w-64 space-y-8",
                    filterOpen ? "block" : "hidden lg:block"
                )}>
                    {/* Price Range */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                            Price Range
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
                            />
                        </div>
                    </div>

                    {/* Quick Clear */}
                    {(minPrice || maxPrice || selectedBrand !== 'all') && (
                        <button
                            onClick={() => {
                                setMinPrice('');
                                setMaxPrice('');
                                setSelectedBrand('all');
                            }}
                            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear all filters
                        </button>
                    )}
                </aside>

                {/* Main Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl">
                            <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                            <p className="text-gray-500">Searching for products...</p>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    slug={product.slug}
                                    name={product.name}
                                    price={product.price}
                                    image={product.primaryImage}
                                    brand={product.brand}
                                    variants={product.variants}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl">
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                <Search className="w-6 h-6 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                We couldn't find any products matching your search or filters. Try adjusting them.
                            </p>
                            <button
                                onClick={() => {
                                    setMinPrice('');
                                    setMaxPrice('');
                                    setSelectedBrand('all');
                                }}
                                className="mt-6 text-brand-blue font-bold hover:underline"
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
