'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Edit, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen,
    Loader2, X, Save
} from 'lucide-react';
import clsx from 'clsx';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: number | null;
    isActive: boolean | null;
    children?: Category[];
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [flatCategories, setFlatCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: null as number | null,
        isActive: true,
    });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch both tree and flat list
            const [treeRes, flatRes] = await Promise.all([
                fetch('/api/admin/categories?tree=true'),
                fetch('/api/admin/categories'),
            ]);
            const treeData = await treeRes.json();
            const flatData = await flatRes.json();
            setCategories(treeData);
            setFlatCategories(flatData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const openAddModal = (parentId: number | null = null) => {
        setEditingCategory(null);
        setForm({
            name: '',
            slug: '',
            description: '',
            parentId,
            isActive: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            parentId: category.parentId,
            isActive: category.isActive ?? true,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setModalOpen(false);
                fetchCategories();
            } else {
                alert('Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this category? Products will be unassigned.')) return;

        setDeleting(id);
        try {
            await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setDeleting(null);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const renderCategoryTree = (cats: Category[], level = 0) => {
        return cats.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedIds.has(cat.id);

            return (
                <div key={cat.id}>
                    <div
                        className={clsx(
                            'flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group',
                            level > 0 && 'ml-6'
                        )}
                    >
                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => toggleExpand(cat.id)}
                            className={clsx(
                                'h-6 w-6 flex items-center justify-center rounded-md text-gray-400',
                                hasChildren ? 'hover:bg-gray-200' : 'invisible'
                            )}
                        >
                            {hasChildren && (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                        </button>

                        {/* Folder Icon */}
                        <div className={clsx(
                            'h-8 w-8 rounded-lg flex items-center justify-center',
                            level === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        )}>
                            {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                        </div>

                        {/* Category Name */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                            <p className="text-xs text-gray-500">{cat.slug}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={clsx(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        )}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openAddModal(cat.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                title="Add subcategory"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openEditModal(cat)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Edit"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                disabled={deleting === cat.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                                title="Delete"
                            >
                                {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                        <div className="border-l-2 border-gray-100 ml-6">
                            {renderCategoryTree(cat.children!, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {flatCategories.length} categories
                    </p>
                </div>
                <button
                    onClick={() => openAddModal()}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            {/* Categories Tree */}
            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12">
                        <Folder className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-sm font-medium text-gray-900">No categories yet</p>
                        <p className="text-xs text-gray-500 mt-1">Create your first category to organize products</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {renderCategoryTree(categories)}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({
                                        ...prev,
                                        name: e.target.value,
                                        slug: prev.slug || generateSlug(e.target.value)
                                    }))}
                                    required
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="e.g. Phone Cases"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="phone-cases"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                <select
                                    value={form.parentId || ''}
                                    onChange={(e) => setForm(prev => ({
                                        ...prev,
                                        parentId: e.target.value ? parseInt(e.target.value) : null
                                    }))}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">None (Top Level)</option>
                                    {flatCategories
                                        .filter(c => c.id !== editingCategory?.id)
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.parentId ? '↳ ' : ''}{cat.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Active (visible on store)</span>
                            </label>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
