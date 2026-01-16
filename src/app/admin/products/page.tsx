'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight,
    CheckSquare, Square, Image as ImageIcon, MoreHorizontal, RefreshCw,
    Package
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
    primaryImage?: string;
}

interface ProductsData {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

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
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status,
            });
            const res = await fetch(`/api/admin/products?${params}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

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

    const getStockStatus = (stock: number | null) => {
        if (stock === null || stock === 0) return { label: 'Out of Stock', color: statusColors.outOfStock };
        if (stock < 10) return { label: 'Low Stock', color: statusColors.lowStock };
        return { label: stock.toString(), color: '' };
    };

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
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Link>
            </div>

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

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-4 rounded-xl bg-blue-50 border border-blue-100 p-3">
                    <span className="text-sm font-medium text-blue-700">
                        {selectedIds.size} selected
                    </span>
                    <button
                        onClick={handleBulkDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear selection
                    </button>
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
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                                    </td>
                                </tr>
                            ) : !data || data.products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <p className="text-sm font-medium text-gray-900">No products found</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {search ? 'Try adjusting your search' : 'Add your first product to get started'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                data.products.map((product) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
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
                                                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                                                    </div>
                                                </div>
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
