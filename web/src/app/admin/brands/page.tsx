"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string;
    isPopular: boolean;
    isActive: boolean;
    sortOrder: number;
}

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'brands');

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setForm(prev => ({ ...prev, logo: data.imageUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const [form, setForm] = useState({
        name: '',
        slug: '',
        logo: '',
        isPopular: false,
        isActive: true,
        sortOrder: 0
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    async function fetchBrands() {
        try {
            const res = await fetch('/api/brands'); // Public GET
            if (res.ok) {
                const data = await res.json();
                setBrands(data);
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const openAddModal = () => {
        setEditingBrand(null);
        setForm({
            name: '',
            slug: '',
            logo: '',
            isPopular: false,
            isActive: true,
            sortOrder: 0
        });
        setModalOpen(true);
    };

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setForm({
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo || '',
            isPopular: brand.isPopular,
            isActive: brand.isActive,
            sortOrder: brand.sortOrder || 0
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingBrand
                ? `/api/admin/brands/${editingBrand.id}`
                : '/api/admin/brands';
            const method = editingBrand ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchBrands();
            } else {
                alert('Failed to save brand');
            }
        } catch (error) {
            console.error('Error saving brand:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this brand?')) return;
        setDeleting(id);
        try {
            await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
            fetchBrands();
        } catch (error) {
            console.error('Failed to delete brand:', error);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-sm text-gray-500">Manage brands and their logos.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Brand
                </button>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search brands..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">Logo</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Popular</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : filteredBrands.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No brands found.</td></tr>
                        ) : (
                            filteredBrands.map((brand) => (
                                <tr key={brand.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="h-10 w-16 relative flex items-center justify-center bg-gray-50 rounded border border-gray-100 p-1">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{brand.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${brand.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${brand.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {brand.isPopular && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 border border-amber-100">
                                                ★ Popular
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(brand)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                {deleting === brand.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-sm text-blue-800">
                <p className="font-bold mb-1">💡 Logo Size Guide</p>
                <p>For best results in the "Shop by Brand" grid, use logos with:</p>
                <ul className="list-disc list-inside mt-1 ml-1 text-blue-700/80">
                    <li>Aspect Ratio: <strong>3:2</strong> (e.g., 300x200px)</li>
                    <li>Format: <strong>SVG</strong> (preferred) or PNG with transparent background</li>
                    <li>Keep padding around the logo text/icon so it doesn't touch the edges.</li>
                </ul>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingBrand ? 'Edit Brand' : 'Add Brand'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({
                                        ...prev,
                                        name: e.target.value,
                                        slug: editingBrand ? prev.slug : generateSlug(e.target.value)
                                    }))}
                                    required
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2.5 file:px-4
                                                file:rounded-xl file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                                transition-all"
                                        />
                                        {uploading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                                    </div>

                                    {form.logo && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                            <div className="h-10 w-16 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
                                                <img src={form.logo} alt="Preview" className="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 truncate">{form.logo.split('/').pop()}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setForm(prev => ({ ...prev, logo: '' }))}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.isPopular}
                                        onChange={(e) => setForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Popular Brand</span>
                                        <span className="block text-xs text-gray-500">Show in "Popular" filters list</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Active Status</span>
                                        <span className="block text-xs text-gray-500">Visible on public store</span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
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
                                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : 'Save Brand'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
