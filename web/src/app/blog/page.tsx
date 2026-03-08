'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Search, Clock, User, ChevronRight,
    Calendar, ArrowRight, Tag, Filter
} from 'lucide-react';
import clsx from 'clsx';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featuredImageUrl: string;
    publishedAt: string;
    viewCount: number;
    category: {
        name: string;
        slug: string;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

function BlogListingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const currentCategory = searchParams.get('category') || 'all';

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [postsRes, catsRes] = await Promise.all([
                    fetch(`/api/blogs?${searchParams.toString()}`),
                    fetch('/api/blog-categories')
                ]);
                const postsData = await postsRes.json();
                setPosts(Array.isArray(postsData.posts) ? postsData.posts : []);
                const catsData = await catsRes.json();
                setCategories(Array.isArray(catsData) ? catsData : []);
            } catch (error) {
                console.error("Error fetching blog data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [searchParams]);

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') {
            params.delete('categoryId');
            params.delete('category');
        } else {
            const cat = categories.find(c => c.slug === slug);
            if (cat) params.set('categoryId', cat.id.toString());
            params.set('category', slug);
        }
        router.push(`/blog?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* SEO Head implementation would go here via Metadata API in a parent RSC, 
                but for client-side we focus on the UI/UX. */}

            {/* Hero / Header */}
            <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Blog</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        Latest news, repair guides, and tech tips from the experts at Lakemba Mobile King.
                    </p>
                </div>
            </section>

            {/* Sticky Navigation & Search */}
            <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Horizontal Scrollable Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 w-full md:w-auto">
                        <button
                            onClick={() => handleCategoryClick('all')}
                            className={clsx(
                                "flex-shrink-0 px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                                currentCategory === 'all'
                                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            All Posts
                        </button>
                        {Array.isArray(categories) && categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug)}
                                className={clsx(
                                    "flex-shrink-0 px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                                    currentCategory === cat.slug
                                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-blue/20 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set('search', (e.target as HTMLInputElement).value);
                                    router.push(`/blog?${params.toString()}`);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="container mx-auto px-4 mt-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                                <div className="aspect-[16/10] bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No articles found</h3>
                        <p className="text-gray-500 mb-8">Try adjusting your category or search terms.</p>
                        <button onClick={() => router.push('/blog')} className="text-brand-blue font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all">
                            View all posts <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.isArray(posts) && posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={post.featuredImageUrl || '/images/blog-placeholder.jpg'}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-sm uppercase tracking-wider">
                                            {post.category?.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> 5 min read</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-brand-blue transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-light">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2 group-hover:gap-3 transition-all">
                                            Read More <ArrowRight className="text-brand-blue" size={16} />
                                        </span>
                                        <span className="text-xs text-brand-blue font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Tag size={12} /> {post.category?.slug}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <BlogListingContent />
        </Suspense>
    );
}
