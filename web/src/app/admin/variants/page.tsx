'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Tag, Loader2, X, ChevronRight, Settings2, MoreVertical
} from 'lucide-react';

interface VariantOption {
    id: number;
    value: string;
}

interface VariantType {
    id: number;
    name: string;
    options: VariantOption[];
}

export default function VariantsPage() {
    const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddTypeModal, setShowAddTypeModal] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [showAddOptionFor, setShowAddOptionFor] = useState<number | null>(null);
    const [newOptionValue, setNewOptionValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchVariants();
    }, []);

    const fetchVariants = async () => {
        try {
            const res = await fetch('/api/admin/variants');
            const data = await res.json();
            setVariantTypes(data);
        } catch (error) {
            console.error('Error fetching variants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'createType', name: newTypeName }),
            });
            if (res.ok) {
                setNewTypeName('');
                setShowAddTypeModal(false);
                fetchVariants();
            }
        } catch (error) {
            console.error('Error creating type:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateOption = async (typeId: number) => {
        if (!newOptionValue.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/variants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'createOption', typeId, value: newOptionValue }),
            });
            if (res.ok) {
                setNewOptionValue('');
                setShowAddOptionFor(null);
                fetchVariants();
            }
        } catch (error) {
            console.error('Error creating option:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteType = async (typeId: number) => {
        if (!confirm('Are you sure you want to delete this variant type and all its options?')) return;
        try {
            const res = await fetch(`/api/admin/variants?typeId=${typeId}`, { method: 'DELETE' });
            if (res.ok) fetchVariants();
        } catch (error) {
            console.error('Error deleting type:', error);
        }
    };

    const handleDeleteOption = async (optionId: number) => {
        try {
            const res = await fetch(`/api/admin/variants?optionId=${optionId}`, { method: 'DELETE' });
            if (res.ok) fetchVariants();
        } catch (error) {
            console.error('Error deleting option:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Variants</h1>
                    <p className="text-gray-500 mt-1">Manage global variant types (e.g., Color, Size) and their options.</p>
                </div>
                <button
                    onClick={() => setShowAddTypeModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Variant Type
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {variantTypes.map((type) => (
                    <div key={type.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Tag className="h-4 w-4 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">{type.name}</h3>
                            </div>
                            <button
                                onClick={() => handleDeleteType(type.id)}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-5 flex-grow overflow-y-auto max-h-[300px] space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {type.options.map((opt) => (
                                    <div
                                        key={opt.id}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                                    >
                                        {opt.value}
                                        <button
                                            onClick={() => handleDeleteOption(opt.id)}
                                            className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {type.options.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4 italic">No options added yet</p>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                            {showAddOptionFor === type.id ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newOptionValue}
                                        onChange={(e) => setNewOptionValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateOption(type.id)}
                                        placeholder="e.g. XL, Red, 128GB"
                                        className="flex-grow rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <button
                                        onClick={() => handleCreateOption(type.id)}
                                        disabled={submitting}
                                        className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddOptionFor(null);
                                            setNewOptionValue('');
                                        }}
                                        className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddOptionFor(type.id)}
                                    className="w-full text-center py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 transition-colors"
                                >
                                    + Add Option
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {variantTypes.length === 0 && (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                        <Tag className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No variants created yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Start by creating your first variant type like "Color" or "Size" to give your customers more choices.
                        </p>
                        <button
                            onClick={() => setShowAddTypeModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            New Variant Type
                        </button>
                    </div>
                )}
            </div>

            {/* Add Type Modal */}
            {showAddTypeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Create Variant Type</h2>
                            <button onClick={() => setShowAddTypeModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type Name</label>
                            <input
                                autoFocus
                                type="text"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateType()}
                                placeholder="e.g. Color, Size, Storage, RAM"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <p className="mt-2 text-xs text-gray-400">This will be shown as the label on the product page.</p>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => setShowAddTypeModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateType}
                                disabled={submitting || !newTypeName.trim()}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/25"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Create Type'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
