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
        <section className="bg-white border-b border-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-brand-blue uppercase tracking-tight">
                        Shop By Brand
                    </h2>
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-2 md:gap-4 no-scrollbar scroll-smooth pb-4 px-1"
                    >
                        {/* "All" Tab - Styled as a special card */}
                        <button
                            onClick={() => onBrandChange("")}
                            className={clsx(
                                "flex-shrink-0 w-[19%] md:w-[9%] h-14 md:h-20 rounded-xl flex items-center justify-center text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all duration-300 border-2",
                                !activeBrandSlug
                                    ? "bg-brand-blue text-white border-brand-blue shadow-lg scale-95 md:scale-105"
                                    : "bg-white text-gray-500 border-gray-100 hover:border-brand-blue/30 hover:shadow-md"
                            )}
                        >
                            All
                        </button>

                        {brands.map((brand) => (
                            <button
                                key={brand.id}
                                onClick={() => onBrandChange(brand.slug)}
                                className={clsx(
                                    "flex-shrink-0 w-[19%] md:w-[9%] h-14 md:h-20 bg-white rounded-xl border flex items-center justify-center transition-all duration-300 relative overflow-hidden group/brand",
                                    activeBrandSlug === brand.slug
                                        ? "border-brand-blue shadow-lg ring-1 ring-brand-blue/20 scale-95 md:scale-105"
                                        : "border-gray-100 hover:border-brand-blue/30 hover:shadow-md hover:-translate-y-1"
                                )}
                            >
                                <div className="w-10 md:w-20 h-8 md:h-12 relative flex items-center justify-center grayscale group-hover/brand:grayscale-0 transition-all duration-500">
                                    <img
                                        src={brand.logo || ""}
                                        alt={brand.name}
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.name}&background=random`;
                                        }}
                                    />
                                </div>
                                {activeBrandSlug === brand.slug && (
                                    <motion.div
                                        layoutId="activeBrandIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-yellow"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Fade overlay on right for visual cue */}
                    <div className="absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
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
