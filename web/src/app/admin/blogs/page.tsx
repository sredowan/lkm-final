'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Plus, Edit, Trash2, Search, Filter, RefreshCw,
    Eye, EyeOff, MoreVertical, ExternalLink, FileText,
    MessageSquare, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    status: string;
    viewCount: number;
    updatedAt: string;
    category?: {
        name: string;
    };
}

interface BlogsData {
    posts: BlogPost[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export default function AdminBlogs() {
    const [data, setData] = useState<BlogsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [page, setPage] = useState(1);

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status,
            });
            const res = await fetch(`/api/admin/blogs?${params}`);
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || 'Failed to fetch blogs');
            }

            setData(json);
        } catch (error: any) {
            console.error('Error fetching blogs:', error);
            setError(error.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {data ? `${data.total} posts total` : 'Loading...'}
                    </p>
                </div>
                <Link
                    href="/admin/blogs/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    New Post
                </Link>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
                <button
                    onClick={fetchBlogs}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className={clsx('h-4 w-4', loading && 'animate-spin')} />
                </button>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Views</th>
                            <th className="px-6 py-4">Last Updated</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
                                    Loading blogs...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                                    <p className="font-bold">Error loading blogs</p>
                                    <p className="text-sm opacity-80">{error}</p>
                                </td>
                            </tr>
                        ) : !data?.posts || data.posts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                    No posts found
                                </td>
                            </tr>
                        ) : (
                            data?.posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {post.category?.name || 'Uncategorized'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                            post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        )}>
                                            {post.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {post.viewCount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(post.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View Post"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/blogs/${post.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit Post"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Post"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">
                        Page {data.page} of {data.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            disabled={page === data.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
