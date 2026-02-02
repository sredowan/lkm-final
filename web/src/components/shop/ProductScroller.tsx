"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface Variant {
    id: number;
    color?: string;
    storage?: string;
    price?: string | number;
    stock?: number;
}

interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    imageUrl?: string;
    primaryImage?: string;
    brand?: string;
    condition?: string;
    variants?: Variant[];
}

interface ProductScrollerProps {
    title: string;
    products: Product[];
    loading?: boolean;
    viewAllLink?: string;
    hideArrows?: boolean;
}

export default function ProductScroller({ title, products, loading, viewAllLink, hideArrows }: ProductScrollerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };


    return (
        <section className="py-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    {viewAllLink ? (
                        <Link href={viewAllLink} className="flex-grow">
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900 uppercase tracking-tight relative border-l-4 border-brand-yellow pl-3">
                                {title}
                            </h2>
                        </Link>
                    ) : (
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900 uppercase tracking-tight relative border-l-4 border-brand-yellow pl-3">
                            {title}
                        </h2>
                    )}

                    <div className="flex gap-2 items-center">
                        {!hideArrows && (
                            <>
                                <button
                                    onClick={() => scroll('left')}
                                    className="hidden md:flex w-10 h-10 rounded-full bg-white border border-gray-100 items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="hidden md:flex w-10 h-10 rounded-full bg-white border border-gray-100 items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {viewAllLink && (
                            <Link href={viewAllLink} className="text-brand-blue font-bold text-xs uppercase tracking-widest hover:underline whitespace-nowrap ml-2">
                                See All →
                            </Link>
                        )}
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 no-scrollbar pb-10 -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[240px] md:w-[280px] h-[400px] bg-gray-100 rounded-3xl animate-pulse" />
                        ))
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="flex-shrink-0 w-[240px] md:w-[280px]">
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
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-20 text-gray-400 font-medium">
                            No products found in this category.
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}

