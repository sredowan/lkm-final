"use client";

import { useState, useMemo } from 'react';
import { ChevronDown, Search, Plus, Minus, X, Home } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type Category = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    children?: Category[];
};

interface ShopSidebarProps {
    categories: Category[];
    activeCategory: string | null;
    onCategoryChange: (slug: string | null) => void;
    onClose?: () => void;
    isMobile?: boolean;
}

export default function ShopSidebar({
    categories,
    activeCategory,
    onCategoryChange,
    onClose,
    isMobile = false,
}: ShopSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTrees, setExpandedTrees] = useState<Record<number, boolean>>({});
    const [showMore, setShowMore] = useState<Record<number, boolean>>({});

    const toggleTree = (id: number) => {
        setExpandedTrees(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleShowMore = (id: number) => {
        setShowMore(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        const q = searchQuery.toLowerCase();
        const filterTree = (nodes: Category[]): Category[] =>
            nodes.reduce((acc: Category[], node) => {
                const matches = node.name.toLowerCase().includes(q);
                const filteredChildren = node.children ? filterTree(node.children) : [];
                if (matches || filteredChildren.length > 0) {
                    acc.push({ ...node, children: filteredChildren });
                }
                return acc;
            }, []);
        return filterTree(categories);
    }, [categories, searchQuery]);

    const handleSelect = (slug: string) => {
        onCategoryChange(activeCategory === slug ? null : slug);
        if (isMobile && onClose) onClose();
    };

    const renderCategoryItem = (category: Category, level: number = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedTrees[category.id] || searchQuery.length > 0;
        const isActive = activeCategory === category.slug;
        const children = category.children || [];
        const LIMIT = 3;
        const isShowingMore = showMore[category.id];
        const visibleChildren = isShowingMore || searchQuery ? children : children.slice(0, LIMIT);
        const hasMore = children.length > LIMIT;

        return (
            <div key={category.id} style={{ marginLeft: level > 0 ? `${level * 12}px` : 0 }}>
                <div
                    className={clsx(
                        "flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer transition-all duration-200 select-none group",
                        isActive
                            ? "bg-gradient-to-r from-brand-blue to-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-gray-700 hover:bg-blue-50 hover:text-brand-blue"
                    )}
                    onClick={() => handleSelect(category.slug)}
                >
                    <span className={clsx(
                        "font-semibold leading-snug truncate pr-2",
                        level === 0 ? "text-[14px]" : "text-[13px] font-medium"
                    )}>
                        {category.name}
                    </span>
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleTree(category.id);
                            }}
                            className={clsx(
                                "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                                isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-brand-blue"
                            )}
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", isExpanded ? "rotate-0" : "-rotate-90")} />
                        </button>
                    )}
                </div>

                <AnimatePresence initial={false}>
                    {hasChildren && isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden ml-2 mt-0.5 pl-2 border-l-2 border-blue-100"
                        >
                            {visibleChildren.map(child => renderCategoryItem(child, level + 1))}
                            {hasMore && !searchQuery && (
                                <button
                                    onClick={() => toggleShowMore(category.id)}
                                    className="flex items-center gap-1.5 mt-1 ml-1 py-1 px-2 text-xs font-bold text-brand-blue/70 hover:text-brand-blue transition-colors"
                                >
                                    {isShowingMore
                                        ? <><Minus className="w-3 h-3" /> Show less</>
                                        : <><Plus className="w-3 h-3" /> {children.length - LIMIT} more</>
                                    }
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Browse</h2>
                {isMobile && onClose && (
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 text-sm bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* All Products */}
            <button
                onClick={() => { onCategoryChange(null); if (isMobile && onClose) onClose(); }}
                className={clsx(
                    "flex items-center gap-2.5 w-full py-2 px-3 rounded-xl mb-2 text-sm font-semibold transition-all",
                    !activeCategory
                        ? "bg-gradient-to-r from-brand-blue to-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-600 hover:bg-blue-50 hover:text-brand-blue"
                )}
            >
                <Home className="w-4 h-4 flex-shrink-0" />
                All Products
            </button>

            <div className="h-px bg-gray-100 mb-3" />

            {/* Category Tree */}
            <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-0.5 custom-scrollbar">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map(cat => renderCategoryItem(cat))
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No categories found
                    </div>
                )}
            </div>
        </div>
    );
}
