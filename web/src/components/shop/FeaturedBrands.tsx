"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    isPopular: boolean | null;
}

interface FeaturedBrandsProps {
    brands: Brand[];
    activeBrandSlug?: string;
    onBrandChange: (slug: string) => void;
}

export default function FeaturedBrands({ brands, activeBrandSlug, onBrandChange }: FeaturedBrandsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Removed internal fetching. Brands are now passed via props.

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
        <section className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 py-4">
                    {/* Header for the section - subtle */}
                    <div className="hidden lg:block pr-6 border-r border-gray-100 flex-shrink-0">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Shop By Brands</h2>
                    </div>

                    {/* Navigation Arrows (Desktop) */}
                    <button
                        onClick={() => scroll('left')}
                        className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Brands Tab List */}
                    <div
                        ref={scrollRef}
                        className="flex-grow flex overflow-x-auto gap-4 md:gap-8 no-scrollbar scroll-smooth items-center px-2"
                    >
                        {/* "All" Tab */}
                        <button
                            onClick={() => onBrandChange("")}
                            className={clsx(
                                "flex-shrink-0 px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap h-12 flex items-center",
                                !activeBrandSlug ? "text-brand-blue" : "text-gray-400 hover:text-gray-900"
                            )}
                        >
                            All
                            {!activeBrandSlug && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-yellow rounded-t-full"
                                />
                            )}
                        </button>

                        {brands.map((brand) => (
                            <button
                                key={brand.id}
                                onClick={() => onBrandChange(brand.slug)}
                                className={clsx(
                                    "flex-shrink-0 flex flex-col items-center justify-center p-2 min-w-[100px] h-12 transition-all relative group opacity-100"
                                )}
                            >
                                <div className="h-8 w-20 relative flex items-center justify-center">
                                    <img
                                        src={brand.logo || ""}
                                        alt={brand.name}
                                        className="max-h-full max-w-full object-contain transition-all duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.name}&background=random`;
                                        }}
                                    />
                                </div>
                                {activeBrandSlug === brand.slug && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-yellow rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Navigation Arrows (Desktop) */}
                    <button
                        onClick={() => scroll('right')}
                        className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="flex-shrink-0 pl-4 border-l border-gray-100 hidden sm:block">
                        <Link href="/shop" className="text-brand-blue font-bold text-xs uppercase tracking-widest hover:underline whitespace-nowrap">Show All →</Link>
                    </div>
                </div>
            </div>

            {/* Grid display for brands as requested (2 col mobile, 5 col desktop) below the header if scrolling is not enough */}
            {/* But user usually wants this in the Shop Page body if it's a "section" */}

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
