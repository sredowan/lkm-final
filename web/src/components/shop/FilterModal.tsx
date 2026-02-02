"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import clsx from "clsx";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
    facets: {
        brands: string[];
        conditions: string[];
        storage: string[];
        priceRange: { min: number; max: number };
    };
}

export interface FilterState {
    minPrice?: number;
    maxPrice?: number;
    conditions: string[]; // multi-select
    storage: string[];    // multi-select
    // brands handled outside usually, or we can add here if we want "Advanced Brand Filter" inside modal too.
    // The user request showed horizontal brand scroller outside. Let's keep brands outside for now based on request "Filters by Brands (Fetch brands related...)" 
    // but typically filter modal includes brands too. Let's include brands as optional multi-select in modal for power users?
    // User request: "Filters by Brands (Fetch brands related to mobiles...)" - this likely refers to the horizontal list shown in screenshot.
    // However, screenshot also shows "FILTER" button.
    // Let's stick to the Screenshot UI + Request Logic. 
    // The screenshot has a "FILTER" button on the left, then "All Products", then Brand chips.
    // So the Filter Modal likely contains Price, Condition, Storage, Type.
}

export default function FilterModal({ isOpen, onClose, onApply, initialFilters, facets }: FilterModalProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    useEffect(() => {
        if (isOpen) {
            setFilters(initialFilters);
        }
    }, [isOpen, initialFilters]);

    const toggleCondition = (condition: string) => {
        setFilters(prev => ({
            ...prev,
            conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter(c => c !== condition)
                : [...prev.conditions, condition]
        }));
    };

    const toggleStorage = (s: string) => {
        setFilters(prev => ({
            ...prev,
            storage: prev.storage.includes(s)
                ? prev.storage.filter(c => c !== s)
                : [...prev.storage, s]
        }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const val = parseInt(e.target.value) || 0;
        setFilters(prev => ({
            ...prev,
            [type === 'min' ? 'minPrice' : 'maxPrice']: val
        }));
    };

    // Quick price format
    const formatPrice = (p?: number) => p ? `$${p}` : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-8">
                            {/* Price Range */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Price Range</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                value={filters.minPrice || ''}
                                                onChange={(e) => handlePriceChange(e, 'min')}
                                                placeholder={facets.priceRange.min.toString()}
                                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-gray-300">-</div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                value={filters.maxPrice || ''}
                                                onChange={(e) => handlePriceChange(e, 'max')}
                                                placeholder={facets.priceRange.max.toString()}
                                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Conditions */}
                            {facets.conditions.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Condition</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {facets.conditions.map(condition => (
                                            <button
                                                key={condition}
                                                onClick={() => toggleCondition(condition)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2",
                                                    filters.conditions.includes(condition)
                                                        ? "bg-brand-blue text-white border-brand-blue"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                {filters.conditions.includes(condition) && <Check className="w-3.5 h-3.5" />}
                                                <span className="capitalize">{condition}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Storage */}
                            {facets.storage.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Storage</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {facets.storage.map(storage => (
                                            <button
                                                key={storage}
                                                onClick={() => toggleStorage(storage)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2",
                                                    filters.storage.includes(storage)
                                                        ? "bg-brand-blue text-white border-brand-blue"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                {filters.storage.includes(storage) && <Check className="w-3.5 h-3.5" />}
                                                {storage}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setFilters({ conditions: [], storage: [] })}
                                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => onApply(filters)}
                                className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-brand-blue hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/20"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
