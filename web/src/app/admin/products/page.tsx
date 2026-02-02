'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight,
    CheckSquare, Square, Image as ImageIcon, RefreshCw,
    Package, DollarSign, Layers, Box, Power, Star, X, Check,
    MoreVertical, ExternalLink, Copy, Eye, EyeOff, TrendingUp, TrendingDown
} from 'lucide-react';
import clsx from 'clsx';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    price: string;
    comparePrice: string | null;
    stock: number | null;
    isActive: boolean | null;
    isFeatured: boolean | null;
    brand: string | null;
    condition: string | null;
    categoryId: number | null;
    categoryName?: string;
    primaryImage?: string;
}

interface ProductsData {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

type BulkAction = 'setPrice' | 'adjustPricePercent' | 'setCategory' | 'setStock' | 'adjustStock' | 'setActive' | 'setFeatured';

const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    lowStock: 'bg-amber-100 text-amber-700',
    outOfStock: 'bg-rose-100 text-rose-700',
};

export default function AdminProducts() {
    const [data, setData] = useState<ProductsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Bulk update state
    const [showBulkUpdate, setShowBulkUpdate] = useState(false);
    const [bulkAction, setBulkAction] = useState<BulkAction>('setPrice');
    const [bulkValue, setBulkValue] = useState<string>('');
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/admin/categories');
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        fetchCategories();
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status,
                ...(categoryFilter !== 'all' && { categoryId: categoryFilter }),
            });
            const res = await fetch(`/api/admin/products?${params}`);
            const json = await res.json();

            // Map category names to products
            const productsWithCategories = json.products.map((product: Product) => ({
                ...product,
                categoryName: categories.find(c => c.id === product.categoryId)?.name || null,
            }));

            setData({ ...json, products: productsWithCategories });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, status, categoryFilter, categories]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (!data) return;
        if (selectedIds.size === data.products.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data.products.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} product(s)?`)) return;

        setDeleting(true);
        try {
            await fetch('/api/admin/products/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            setSelectedIds(new Set());
            fetchProducts();
        } catch (error) {
            console.error('Error deleting products:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedIds.size === 0) return;

        setBulkUpdating(true);
        setBulkMessage(null);

        try {
            let value: any = bulkValue;

            // Parse value based on action type
            if (bulkAction === 'setPrice' || bulkAction === 'adjustPricePercent') {
                value = parseFloat(bulkValue);
            } else if (bulkAction === 'setStock' || bulkAction === 'adjustStock') {
                value = parseInt(bulkValue);
            } else if (bulkAction === 'setCategory') {
                value = bulkValue === '' ? null : parseInt(bulkValue);
            } else if (bulkAction === 'setActive' || bulkAction === 'setFeatured') {
                value = bulkValue === 'true';
            }

            const res = await fetch('/api/admin/products/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: Array.from(selectedIds),
                    action: bulkAction,
                    value,
                }),
            });

            const result = await res.json();

            if (result.success) {
                setBulkMessage({ type: 'success', text: result.message });
                setSelectedIds(new Set());
                setShowBulkUpdate(false);
                setBulkValue('');
                fetchProducts();
            } else {
                setBulkMessage({ type: 'error', text: result.error || 'Update failed' });
            }
        } catch (error) {
            setBulkMessage({ type: 'error', text: 'Failed to update products' });
        } finally {
            setBulkUpdating(false);
        }
    };

    const getStockStatus = (stock: number | null) => {
        if (stock === null || stock === 0) return { label: 'Out of Stock', color: statusColors.outOfStock };
        if (stock < 10) return { label: 'Low Stock', color: statusColors.lowStock };
        return { label: stock.toString(), color: '' };
    };

    const getBulkActionLabel = (action: BulkAction) => {
        const labels: Record<BulkAction, string> = {
            setPrice: 'Set Price',
            adjustPricePercent: 'Adjust Price %',
            setCategory: 'Change Category',
            setStock: 'Set Stock',
            adjustStock: 'Adjust Stock',
            setActive: 'Set Status',
            setFeatured: 'Set Featured',
        };
        return labels[action];
    };

    const getBulkActionIcon = (action: BulkAction) => {
        const icons: Record<BulkAction, React.ReactNode> = {
            setPrice: <DollarSign className="h-4 w-4" />,
            adjustPricePercent: <TrendingUp className="h-4 w-4" />,
            setCategory: <Layers className="h-4 w-4" />,
            setStock: <Box className="h-4 w-4" />,
            adjustStock: <TrendingDown className="h-4 w-4" />,
            setActive: <Power className="h-4 w-4" />,
            setFeatured: <Star className="h-4 w-4" />,
        };
        return icons[action];
    };

    // Stats
    const stats = data ? {
        total: data.total,
        active: data.products.filter(p => p.isActive).length,
        lowStock: data.products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10).length,
        outOfStock: data.products.filter(p => (p.stock ?? 0) === 0).length,
    } : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {data ? `${data.total} products` : 'Loading...'}
                    </p>
                </div>
                <Link
                    href="/admin/products/add"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Eye className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                <p className="text-xs text-gray-500">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Box className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
                                <p className="text-xs text-gray-500">Low Stock</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                                <EyeOff className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
                                <p className="text-xs text-gray-500">Out of Stock</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[140px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="lowStock">Low Stock</option>
                        <option value="outOfStock">Out of Stock</option>
                    </select>
                </div>

                {/* Refresh */}
                <button
                    onClick={fetchProducts}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
                </button>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <CheckSquare className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-blue-700">
                            {selectedIds.size} selected
                        </span>
                    </div>

                    <div className="h-6 w-px bg-blue-200" />

                    <button
                        onClick={() => setShowBulkUpdate(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        Bulk Update
                    </button>

                    <button
                        onClick={handleBulkDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>

                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            {/* Bulk Update Modal */}
            {showBulkUpdate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Bulk Update Products</h3>
                            <button
                                onClick={() => { setShowBulkUpdate(false); setBulkMessage(null); }}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <p className="text-sm text-gray-600">
                                Updating <span className="font-semibold text-blue-600">{selectedIds.size}</span> products
                            </p>

                            {/* Action Type Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                {(['setPrice', 'adjustPricePercent', 'setCategory', 'setStock', 'adjustStock', 'setActive', 'setFeatured'] as BulkAction[]).map((action) => (
                                    <button
                                        key={action}
                                        onClick={() => { setBulkAction(action); setBulkValue(''); }}
                                        className={clsx(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                            bulkAction === action
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        )}
                                    >
                                        {getBulkActionIcon(action)}
                                        {getBulkActionLabel(action)}
                                    </button>
                                ))}
                            </div>

                            {/* Value Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {bulkAction === 'setPrice' && 'New Price ($)'}
                                    {bulkAction === 'adjustPricePercent' && 'Percentage Change (use - for decrease)'}
                                    {bulkAction === 'setCategory' && 'Select Category'}
                                    {bulkAction === 'setStock' && 'New Stock Quantity'}
                                    {bulkAction === 'adjustStock' && 'Stock Adjustment (use - to decrease)'}
                                    {bulkAction === 'setActive' && 'Status'}
                                    {bulkAction === 'setFeatured' && 'Featured Status'}
                                </label>

                                {(bulkAction === 'setPrice' || bulkAction === 'adjustPricePercent') && (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {bulkAction === 'setPrice' ? '$' : '%'}
                                        </span>
                                        <input
                                            type="number"
                                            step={bulkAction === 'setPrice' ? '0.01' : '1'}
                                            value={bulkValue}
                                            onChange={(e) => setBulkValue(e.target.value)}
                                            placeholder={bulkAction === 'setPrice' ? '0.00' : 'e.g. 10 or -10'}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                )}

                                {(bulkAction === 'setStock' || bulkAction === 'adjustStock') && (
                                    <input
                                        type="number"
                                        value={bulkValue}
                                        onChange={(e) => setBulkValue(e.target.value)}
                                        placeholder={bulkAction === 'setStock' ? 'Enter quantity' : 'e.g. 10 or -5'}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                )}

                                {bulkAction === 'setCategory' && (
                                    <select
                                        value={bulkValue}
                                        onChange={(e) => setBulkValue(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">No Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                )}

                                {(bulkAction === 'setActive' || bulkAction === 'setFeatured') && (
                                    <select
                                        value={bulkValue}
                                        onChange={(e) => setBulkValue(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">Select...</option>
                                        <option value="true">{bulkAction === 'setActive' ? 'Active' : 'Featured'}</option>
                                        <option value="false">{bulkAction === 'setActive' ? 'Inactive' : 'Not Featured'}</option>
                                    </select>
                                )}
                            </div>

                            {/* Message */}
                            {bulkMessage && (
                                <div className={clsx(
                                    'flex items-center gap-2 p-3 rounded-lg text-sm',
                                    bulkMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                )}>
                                    {bulkMessage.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                    {bulkMessage.text}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
                            <button
                                onClick={() => { setShowBulkUpdate(false); setBulkMessage(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUpdate}
                                disabled={bulkUpdating || !bulkValue}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {bulkUpdating ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Apply Update
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-4 py-3 text-left">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                        {data && selectedIds.size === data.products.length && data.products.length > 0 ? (
                                            <CheckSquare className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                                    </td>
                                </tr>
                            ) : !data || data.products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-sm font-medium text-gray-900">No products found</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {search || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first product to get started'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                data.products.map((product) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    return (
                                        <tr key={product.id} className={clsx(
                                            'hover:bg-gray-50/50 transition-colors',
                                            selectedIds.has(product.id) && 'bg-blue-50/50'
                                        )}>
                                            <td className="px-4 py-3">
                                                <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-gray-600">
                                                    {selectedIds.has(product.id) ? (
                                                        <CheckSquare className="h-5 w-5 text-blue-600" />
                                                    ) : (
                                                        <Square className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {/* Image Thumbnail */}
                                                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        {product.primaryImage ? (
                                                            <img
                                                                src={product.primaryImage}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-500">{product.sku || 'No SKU'}</span>
                                                            {product.isFeatured && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                                                                    <Star className="h-3 w-3" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {product.categoryName ? (
                                                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                                        {product.categoryName}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Uncategorized</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-semibold text-gray-900">${Number(product.price).toFixed(2)}</p>
                                                    {product.comparePrice && (
                                                        <p className="text-xs text-gray-400 line-through">
                                                            ${Number(product.comparePrice).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {stockStatus.color ? (
                                                    <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', stockStatus.color)}>
                                                        {stockStatus.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-900">{stockStatus.label}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={clsx(
                                                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                    product.isActive ? statusColors.active : statusColors.inactive
                                                )}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/shop/${product.slug}`}
                                                        target="_blank"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                                        title="View on store"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        title="Edit product"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * data.pageSize) + 1} to {Math.min(page * data.pageSize, data.total)} of {data.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                {page} / {data.totalPages}
                            </span>
                            <button
                                disabled={page >= data.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
