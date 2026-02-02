import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export interface FilterState {
    minPrice?: number;
    maxPrice?: number;
    conditions: string[];
    storage: string[];
}

interface FilterBarProps {
    facets: {
        brands: string[];
        conditions: string[];
        storage: string[];
        priceRange: { min: number; max: number };
    };
    filters: FilterState;
    onApply: (filters: FilterState) => void;
    activeBrandSlug: string; // To highlight active brand if selected via main logic, or we merge activeBrand into filters
    onBrandChange: (slug: string) => void;
}

export default function FilterBar({ facets, filters, onApply, activeBrandSlug, onBrandChange }: FilterBarProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Only close if not clicking inside a portal (if we used one, but here we don't for desktop)
                // For mobile we use fixed overlay so this logic might conflict if not careful
                // We'll handle mobile close separately
                if (window.innerWidth >= 768) {
                    setOpenDropdown(null);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(prev => prev === name ? null : name);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const val = e.target.value ? parseInt(e.target.value) : undefined;
        onApply({
            ...filters,
            [type === 'min' ? 'minPrice' : 'maxPrice']: val
        });
    };

    const toggleCondition = (condition: string) => {
        const newConditions = filters.conditions.includes(condition)
            ? filters.conditions.filter(c => c !== condition)
            : [...filters.conditions, condition];
        onApply({ ...filters, conditions: newConditions });
    };

    const toggleStorage = (s: string) => {
        const newStorage = filters.storage.includes(s)
            ? filters.storage.filter(c => c !== s)
            : [...filters.storage, s];
        onApply({ ...filters, storage: newStorage });
    };

    // Mobile Bottom Sheet / Desktop Dropdown wrapper
    const FilterPanel = ({ title, children, active }: { title: string, children: React.ReactNode, active: boolean }) => (
        <AnimatePresence>
            {active && (
                <>
                    {/* Mobile Overlay & Sheet */}
                    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpenDropdown(null)}
                            className="absolute inset-0 bg-black"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white rounded-t-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                                <button onClick={() => setOpenDropdown(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            {children}
                            <button
                                onClick={() => setOpenDropdown(null)}
                                className="w-full mt-6 bg-brand-blue text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-blue/20"
                            >
                                Show Results
                            </button>
                        </motion.div>
                    </div>

                    {/* Desktop Dropdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className="hidden md:block absolute top-full left-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-100 p-5 min-w-[320px] z-50"
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                            <span className="font-bold text-gray-900">{title}</span>
                            <button onClick={() => setOpenDropdown(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div
            className="bg-white border-b border-gray-200 sticky z-40 transition-all duration-300"
            // Dynamic top positioning - Estimated header height ~100px. 
            // We use standard top-0 if we are wrapperless, but sticky needs precise offset if header is fixed.
            // Assuming header is ~104px. User reported gap, maybe reduce? Let's try top-[90px].
            style={{ top: '90px' }}
            ref={dropdownRef}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 py-3 overflow-x-auto no-scrollbar scroll-smooth">

                    {/* Price Filter */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => toggleDropdown('price')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md",
                                (filters.minPrice || filters.maxPrice)
                                    ? "bg-brand-blue text-white border-brand-blue ring-2 ring-brand-blue/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            Price
                            {(filters.minPrice || filters.maxPrice) && <span className="ml-1 text-xs opacity-90 px-1.5 py-0.5 bg-white/20 rounded-full">${filters.minPrice || 0} - ${filters.maxPrice || '+'}</span>}
                            <ChevronDown className={clsx("w-4 h-4 transition-transform ml-1", openDropdown === 'price' && "rotate-180")} />
                        </button>
                        <FilterPanel title="Price Range" active={openDropdown === 'price'}>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 group">
                                    <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wide">Min</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue">$</span>
                                        <input
                                            type="number"
                                            placeholder={facets.priceRange.min.toString()}
                                            value={filters.minPrice || ''}
                                            onChange={(e) => handlePriceChange(e, 'min')}
                                            className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 bg-gray-50 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 text-gray-300 font-light text-2xl">-</div>
                                <div className="relative flex-1 group">
                                    <label className="text-xs text-gray-500 font-semibold mb-1 block uppercase tracking-wide">Max</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue">$</span>
                                        <input
                                            type="number"
                                            placeholder={facets.priceRange.max.toString()}
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handlePriceChange(e, 'max')}
                                            className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 bg-gray-50 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FilterPanel>
                    </div>

                    {/* Brand Filter */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => toggleDropdown('brand')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md",
                                activeBrandSlug
                                    ? "bg-brand-blue text-white border-brand-blue ring-2 ring-brand-blue/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            Brand
                            {activeBrandSlug && <span className="ml-1 text-xs opacity-90 px-1.5 py-0.5 bg-white/20 rounded-full max-w-[80px] truncate">{activeBrandSlug}</span>}
                            <ChevronDown className={clsx("w-4 h-4 transition-transform ml-1", openDropdown === 'brand' && "rotate-180")} />
                        </button>
                        <FilterPanel title="Select Brand" active={openDropdown === 'brand'}>
                            <div className="max-h-[300px] overflow-y-auto grid grid-cols-2 gap-2 custom-scrollbar">
                                <button
                                    onClick={() => { onBrandChange(""); setOpenDropdown(null); }}
                                    className={clsx(
                                        "px-4 py-3 rounded-xl text-sm text-left transition-all border",
                                        !activeBrandSlug
                                            ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue font-bold ring-1 ring-brand-blue/20"
                                            : "border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium"
                                    )}
                                >
                                    All Brands
                                </button>
                                {facets.brands.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => { onBrandChange(brand); setOpenDropdown(null); }}
                                        className={clsx(
                                            "px-4 py-3 rounded-xl text-sm text-left transition-all border truncate",
                                            activeBrandSlug === brand
                                                ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue font-bold ring-1 ring-brand-blue/20"
                                                : "border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium"
                                        )}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </FilterPanel>
                    </div>

                    {/* Condition Filter */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => toggleDropdown('condition')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md",
                                filters.conditions.length > 0
                                    ? "bg-brand-blue text-white border-brand-blue ring-2 ring-brand-blue/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            Condition
                            {filters.conditions.length > 0 && <span className="ml-1 text-xs opacity-90 px-1.5 py-0.5 bg-white/20 rounded-full">{filters.conditions.length}</span>}
                            <ChevronDown className={clsx("w-4 h-4 transition-transform ml-1", openDropdown === 'condition' && "rotate-180")} />
                        </button>
                        <FilterPanel title="Condition" active={openDropdown === 'condition'}>
                            <div className="flex flex-col gap-2">
                                {facets.conditions.map(condition => (
                                    <label key={condition} className={clsx(
                                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all",
                                        filters.conditions.includes(condition)
                                            ? "border-brand-blue/30 bg-brand-blue/5"
                                            : "border-transparent hover:bg-gray-50"
                                    )}>
                                        <div className={clsx(
                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm",
                                            filters.conditions.includes(condition)
                                                ? "bg-brand-blue border-brand-blue"
                                                : "border-gray-300 bg-white"
                                        )}>
                                            {filters.conditions.includes(condition) && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={filters.conditions.includes(condition)}
                                            onChange={() => toggleCondition(condition)}
                                        />
                                        <span className={clsx(
                                            "text-sm capitalize font-medium",
                                            filters.conditions.includes(condition) ? "text-brand-blue" : "text-gray-700"
                                        )}>{condition}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterPanel>
                    </div>

                    {/* Storage Filter */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => toggleDropdown('storage')}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all whitespace-nowrap shadow-sm hover:shadow-md",
                                filters.storage.length > 0
                                    ? "bg-brand-blue text-white border-brand-blue ring-2 ring-brand-blue/20"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            Storage
                            {filters.storage.length > 0 && <span className="ml-1 text-xs opacity-90 px-1.5 py-0.5 bg-white/20 rounded-full">{filters.storage.length}</span>}
                            <ChevronDown className={clsx("w-4 h-4 transition-transform ml-1", openDropdown === 'storage' && "rotate-180")} />
                        </button>
                        <FilterPanel title="Storage" active={openDropdown === 'storage'}>
                            <div className="grid grid-cols-3 gap-3">
                                {facets.storage.map(storage => (
                                    <button
                                        key={storage}
                                        onClick={() => toggleStorage(storage)}
                                        className={clsx(
                                            "px-3 py-2.5 rounded-xl text-sm border font-medium transition-all shadow-sm",
                                            filters.storage.includes(storage)
                                                ? "bg-brand-blue text-white border-brand-blue ring-2 ring-brand-blue/20"
                                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        )}
                                    >
                                        {storage}
                                    </button>
                                ))}
                            </div>
                        </FilterPanel>
                    </div>

                    {/* Clear Filters - Only show if any active */}
                    {(activeBrandSlug || filters.minPrice || filters.maxPrice || filters.conditions.length > 0 || filters.storage.length > 0) && (
                        <button
                            onClick={() => {
                                onBrandChange("");
                                onApply({ conditions: [], storage: [] });
                            }}
                            className="flex-shrink-0 text-sm text-red-500 font-bold hover:underline px-3 transition-colors bg-red-50 hover:bg-red-100 py-2 rounded-lg"
                        >
                            Reset
                        </button>
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
        </div>
    );
}
