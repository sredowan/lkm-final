'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Save, ArrowLeft, Image as ImageIcon, Plus, X, Loader2,
    Search, Tag, Package, BarChart3
} from 'lucide-react';
import clsx from 'clsx';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    shortDescription: string | null;
    price: string;
    comparePrice: string | null;
    cost: string | null;
    categoryId: number | null;
    brand: string | null;
    condition: string | null;
    stock: number | null;
    isActive: boolean | null;
    isFeatured: boolean | null;
    metaTitle: string | null;
    metaDescription: string | null;
}

interface ProductImage {
    id: number;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean | null;
}

interface ProductVariant {
    id?: number;
    color: string;
    storage: string;
    sku: string;
    price: string;
    comparePrice: string;
    stock: number;
    isActive: boolean;
}

interface Category {
    id: number;
    name: string;
    parentId: number | null;
    children?: Category[];
}

const tabs = [
    { id: 'general', label: 'General', icon: Package },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'variants', label: 'Variants', icon: Tag },
    { id: 'pricing', label: 'Pricing & Stock', icon: BarChart3 },
    { id: 'seo', label: 'SEO', icon: Search },
];

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const isNew = productId === 'add';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<ProductImage[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<Partial<Product>>({
        name: '',
        slug: '',
        sku: '',
        description: '',
        shortDescription: '',
        price: '',
        comparePrice: '',
        cost: '',
        categoryId: null,
        brand: '',
        condition: 'new',
        stock: 0,
        isActive: true,
        isFeatured: false,
        metaTitle: '',
        metaDescription: '',
    });

    useEffect(() => {
        if (!isNew) {
            fetchProduct();
        }
        fetchCategories();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/admin/products/${productId}`);
            const data = await res.json();
            setForm(data.product);
            setImages(data.images || []);
            setVariants(data.variants || []);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories?tree=true');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Flatten category tree for dropdown with indentation
    const flattenCategories = (cats: Category[], depth = 0): { id: number; name: string; depth: number }[] => {
        let result: { id: number; name: string; depth: number }[] = [];
        for (const cat of cats) {
            result.push({ id: cat.id, name: cat.name, depth });
            if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, depth + 1));
            }
        }
        return result;
    };

    const categoryOptions = flattenCategories(categories);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;

        if (type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            newValue = value ? parseInt(value) : 0;
        }

        setForm(prev => ({
            ...prev,
            [name]: newValue,
            ...(name === 'name' && !form.slug ? { slug: generateSlug(value) } : {}),
        }));
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    // Add to local images array (temporary ID for display)
                    const newImage: ProductImage = {
                        id: Date.now() + Math.random(),
                        imageUrl: data.imageUrl,
                        altText: file.name,
                        isPrimary: images.length === 0, // First image is primary
                    };
                    setImages(prev => [...prev, newImage]);
                } else {
                    console.error('Upload failed');
                }
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = (imageId: number) => {
        setImages(prev => {
            const filtered = prev.filter(img => img.id !== imageId);
            // If we deleted the primary image, make the first remaining image primary
            if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
                filtered[0].isPrimary = true;
            }
            return filtered;
        });
    };

    const handleSetPrimary = (imageId: number) => {
        setImages(prev => prev.map(img => ({
            ...img,
            isPrimary: img.id === imageId,
        })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = isNew ? '/api/admin/products' : `/api/admin/products/${productId}`;
            const method = isNew ? 'POST' : 'PUT';

            // Include images and variants in the request body
            const payload = {
                ...form,
                images: images.map(img => ({
                    imageUrl: img.imageUrl,
                    altText: img.altText,
                    isPrimary: img.isPrimary,
                })),
                variants: variants.map(v => ({
                    color: v.color,
                    storage: v.storage,
                    sku: v.sku,
                    price: v.price,
                    comparePrice: v.comparePrice,
                    stock: v.stock,
                    isActive: v.isActive,
                })),
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                const error = await res.json();
                alert(error.message || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isNew ? 'Add Product' : 'Edit Product'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isNew ? 'Create a new product listing' : `Editing: ${form.name}`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Product'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            'inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name || ''}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. iPhone 15 Pro Case"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                                            <input
                                                type="text"
                                                name="slug"
                                                value={form.slug || ''}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="iphone-15-pro-case"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={form.sku || ''}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                placeholder="CASE-IP15P-001"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                        <textarea
                                            name="shortDescription"
                                            value={form.shortDescription || ''}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Brief product summary..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                                        <textarea
                                            name="description"
                                            value={form.description || ''}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Detailed product description..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="categoryId"
                                            value={form.categoryId || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">Select category</option>
                                            {categoryOptions.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {'—'.repeat(cat.depth)} {cat.depth > 0 ? ' ' : ''}{cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={form.brand || ''}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. Apple, Samsung"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                        <select
                                            name="condition"
                                            value={form.condition || 'new'}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="new">New</option>
                                            <option value="refurbished">Refurbished</option>
                                            <option value="used">Used</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={form.isActive || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Active (visible on store)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={form.isFeatured || false}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Featured product</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Images Tab */}
                {activeTab === 'images' && (
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(e.target.files)}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden group">
                                    <img src={img.imageUrl} alt={img.altText || ''} className="h-full w-full object-cover" />

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        {!img.isPrimary && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimary(img.id)}
                                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                                            >
                                                Set as Primary
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(img.id)}
                                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {img.isPrimary && (
                                        <span className="absolute top-2 left-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                            Primary
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* Upload button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <span className="text-sm font-medium">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-8 w-8" />
                                        <span className="text-sm font-medium">Add Image</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-gray-500">
                            Click the Add Image button to upload. Supports JPG, PNG, WebP, GIF up to 5MB each.
                        </p>
                    </div>
                )}

                {/* Variants Tab */}
                {activeTab === 'variants' && (
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                            <button
                                type="button"
                                onClick={() => setVariants(prev => [...prev, {
                                    color: '',
                                    storage: '',
                                    sku: '',
                                    price: '',
                                    comparePrice: '',
                                    stock: 0,
                                    isActive: true,
                                }])}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add Variant
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <div className="text-center py-12">
                                <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-sm font-medium text-gray-900">No variants yet</p>
                                <p className="text-xs text-gray-500 mt-1">Add color/storage combinations with different prices</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {variants.map((variant, index) => (
                                    <div key={index} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-700">Variant {index + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => setVariants(prev => prev.filter((_, i) => i !== index))}
                                                className="p-1 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                                                <select
                                                    value={variant.color}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].color = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                >
                                                    <option value="">Select Color</option>
                                                    <option value="Black">Black</option>
                                                    <option value="White">White</option>
                                                    <option value="Silver">Silver</option>
                                                    <option value="Gold">Gold</option>
                                                    <option value="Rose Gold">Rose Gold</option>
                                                    <option value="Blue">Blue</option>
                                                    <option value="Red">Red</option>
                                                    <option value="Green">Green</option>
                                                    <option value="Purple">Purple</option>
                                                    <option value="Yellow">Yellow</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Storage</label>
                                                <select
                                                    value={variant.storage}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].storage = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                >
                                                    <option value="">Select Storage</option>
                                                    <option value="32GB">32GB</option>
                                                    <option value="64GB">64GB</option>
                                                    <option value="128GB">128GB</option>
                                                    <option value="256GB">256GB</option>
                                                    <option value="512GB">512GB</option>
                                                    <option value="1TB">1TB</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                                                <input
                                                    type="text"
                                                    value={variant.sku}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].sku = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    placeholder="e.g. IPH13-BLK-128"
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].price = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Compare Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={variant.comparePrice}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].comparePrice = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                                                <input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].stock = parseInt(e.target.value) || 0;
                                                        setVariants(newVariants);
                                                    }}
                                                    min="0"
                                                    placeholder="0"
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-4 text-xs text-gray-500">
                            Create variants for different color and storage combinations. Each variant can have its own price and stock.
                        </p>
                    </div>
                )}

                {/* Pricing & Stock Tab */}
                {activeTab === 'pricing' && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price || ''}
                                            onChange={handleChange}
                                            required
                                            step="0.01"
                                            min="0"
                                            className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Compare at Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="comparePrice"
                                            value={form.comparePrice || ''}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Original price (for showing discounts)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Item</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="cost"
                                            value={form.cost || ''}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">For profit calculation</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock || 0}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO Tab */}
                {activeTab === 'seo' && (
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Engine Optimization</h3>
                        <div className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={form.metaTitle || ''}
                                    onChange={handleChange}
                                    maxLength={60}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Page title for search engines"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {(form.metaTitle?.length || 0)}/60 characters
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <textarea
                                    name="metaDescription"
                                    value={form.metaDescription || ''}
                                    onChange={handleChange}
                                    maxLength={160}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Brief description for search results..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {(form.metaDescription?.length || 0)}/160 characters
                                </p>
                            </div>

                            {/* SEO Preview */}
                            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-3">SEARCH PREVIEW</p>
                                <div>
                                    <p className="text-blue-700 text-lg font-medium truncate">
                                        {form.metaTitle || form.name || 'Product Title'}
                                    </p>
                                    <p className="text-emerald-700 text-sm">
                                        lakembamobileking.com/shop/{form.slug || 'product-slug'}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                        {form.metaDescription || form.shortDescription || 'Product description will appear here...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div >
    );
}
