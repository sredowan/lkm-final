'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save, Eye, ArrowLeft, Image as ImageIcon,
    Search, Globe, ChevronDown, CheckCircle2,
    AlertCircle, Info, Hash, Clock, X, Trash2
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import RichTextEditor from './RichTextEditor';
import { TagInput } from './TagInput';

interface BlogCategory {
    id: number;
    name: string;
}

interface BlogEditorProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function BlogEditor({ initialData, isEditing = false }: BlogEditorProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImageUrl: '',
        categoryId: '',
        status: 'draft',
        tags: '',
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        focusKeyword: '',
        secondaryKeywords: [] as string[],
        ogTitle: '',
        ogDescription: '',
        ogImageUrl: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                categoryId: initialData.categoryId?.toString() || '',
                tags: initialData.tags?.map((t: any) => t.name).join(', ') || '',
                secondaryKeywords: initialData.secondaryKeywords ? JSON.parse(initialData.secondaryKeywords) : [],
            });
        }
    }, [initialData]);

    useEffect(() => {
        async function fetchCats() {
            const res = await fetch('/api/blog-categories');
            if (res.ok) setCategories(await res.json());
        }
        fetchCats();
    }, []);

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: isEditing ? prev.slug : generateSlug(title),
            metaTitle: isEditing ? prev.metaTitle : title.slice(0, 60),
        }));
    };

    // SEO Analysis
    const seoAnalysis = useMemo(() => {
        const { title, content, focusKeyword, metaTitle, metaDescription, slug } = formData;
        const checks = [];

        if (!focusKeyword) return [];

        const lowerContent = content.toLowerCase();
        const lowerKeyword = focusKeyword.toLowerCase();

        // 1. Keyword in Title
        checks.push({
            label: "Focus keyword in title",
            passed: title.toLowerCase().includes(lowerKeyword),
            impact: "High"
        });

        // 2. Keyword in Slug
        checks.push({
            label: "Focus keyword in URL slug",
            passed: slug.toLowerCase().includes(lowerKeyword.replace(/ /g, '-')),
            impact: "High"
        });

        // 3. Keyword in Meta Title
        checks.push({
            label: "Focus keyword in meta title",
            passed: metaTitle.toLowerCase().includes(lowerKeyword),
            impact: "Medium"
        });

        // 4. Content length check
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        checks.push({
            label: `Word count: ${wordCount} words`,
            passed: wordCount > 300,
            impact: "Medium",
            hint: wordCount < 300 ? "Try to reach at least 300 words." : ""
        });

        // 5. Meta Description Length
        checks.push({
            label: "Meta description length",
            passed: metaDescription.length >= 120 && metaDescription.length <= 160,
            impact: "Medium",
            hint: `Current length: ${metaDescription.length}. Goal: 120-160.`
        });

        return checks;
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = isEditing ? `/api/admin/blogs/${initialData.id}` : '/api/admin/blogs';
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });
            if (res.ok) {
                router.push('/admin/blogs');
                router.refresh();
            }
        } catch (error) {
            console.error('Error saving blog:', error);
        } finally {
            setSaving(false);
        }
    };

    if (isPreview) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => setIsPreview(false)} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <ArrowLeft size={16} /> Back to Editor
                    </button>
                    <h2 className="text-xl font-bold">Preview Mode</h2>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">{formData.title}</h1>
                    {formData.featuredImageUrl && (
                        <img src={formData.featuredImageUrl} alt="" className="w-full h-96 object-cover rounded-xl mb-8" />
                    )}
                    <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Top Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md py-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blogs" className="p-2 rounded-xl border bg-white hover:bg-gray-50">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Blog Post' : 'Create New Post'}</h1>
                        <p className="text-xs text-gray-500">/{formData.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border bg-white rounded-xl hover:bg-gray-50"
                    >
                        <Eye size={18} /> Preview
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Post Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="Enter a catchy title..."
                                className="w-full text-2xl font-bold border-none bg-gray-50/50 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">URL Slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">/blog/</span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="flex-1 bg-gray-50/50 rounded-lg px-3 py-1.5 text-sm border focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Excerpt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="A brief summary for cards and search results..."
                                rows={2}
                                className="w-full bg-gray-50/50 rounded-xl px-4 py-3 text-sm border focus:bg-white"
                            />
                        </div>
                    </section>

                    {/* Editor */}
                    <section className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Main Content</label>
                        <RichTextEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                        />
                    </section>

                    {/* SEO Panel */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Search className="text-blue-600" size={20} />
                            <h2 className="font-bold text-gray-900">SEO Management</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                                    Meta Title
                                    <span className={clsx("text-[10px]", formData.metaTitle.length > 60 ? "text-red-500" : "text-gray-400")}>
                                        {formData.metaTitle.length}/60
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                    className="w-full bg-gray-50/50 rounded-lg px-3 py-2 text-sm border"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Focus Keyword</label>
                                <input
                                    type="text"
                                    value={formData.focusKeyword}
                                    onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                                    className="w-full bg-gray-50/50 rounded-lg px-3 py-2 text-sm border"
                                    placeholder="e.g. iPhone repair"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                                Meta Description
                                <span className={clsx("text-[10px]", (formData.metaDescription.length < 120 || formData.metaDescription.length > 160) ? "text-amber-500" : "text-gray-400")}>
                                    {formData.metaDescription.length}/160
                                </span>
                            </label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                rows={3}
                                className="w-full bg-gray-50/50 rounded-lg px-3 py-2 text-sm border"
                            />
                        </div>

                        {/* Analysis Helpers */}
                        {formData.focusKeyword && (
                            <div className="bg-blue-50/50 rounded-xl p-4 space-y-3">
                                <div className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={14} /> Analysis Helpers
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {seoAnalysis.map((check, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs">
                                            {check.passed ? <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" /> : <AlertCircle size={14} className="text-amber-500 mt-0.5" />}
                                            <div>
                                                <p className={clsx(check.passed ? "text-gray-700" : "text-gray-500")}>{check.label}</p>
                                                {!check.passed && check.hint && <p className="text-[10px] text-amber-600 italic">{check.hint}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Status & Options */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm border font-medium"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Category</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full bg-gray-50/50 rounded-xl px-4 py-2.5 text-sm border"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tags</label>
                            <TagInput
                                value={formData.tags}
                                onChange={(tags) => setFormData({ ...formData, tags })}
                            />
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <label className="text-sm font-semibold text-gray-700 block">Featured Image</label>
                        <div className="aspect-video bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative group">
                            {formData.featuredImageUrl ? (
                                <>
                                    <img src={formData.featuredImageUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={() => setFormData({ ...formData, featuredImageUrl: '' })} className="text-white bg-red-500/80 p-2 rounded-full">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-xs text-gray-500">Paste an image URL below</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Image URL..."
                            value={formData.featuredImageUrl}
                            onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                            className="w-full text-xs bg-gray-50 rounded-lg px-3 py-2 border"
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}

