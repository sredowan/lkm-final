import { db } from "@/db";
import { blogPosts, blogCategories, blogPostTags, blogTags, admins } from "@/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
    Clock, Calendar, User, ArrowLeft,
    Share2, Facebook, Twitter, Link as LinkIcon,
    ChevronRight, Tag, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
    params: { slug: string };
}

// SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const post = await getPost(params.slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.metaTitle || post.title} | Lakemba Mobile King`,
        description: post.metaDescription || post.excerpt || undefined,
        openGraph: {
            title: post.ogTitle || post.title,
            description: post.ogDescription || post.excerpt || undefined,
            images: [post.ogImageUrl || post.featuredImageUrl || ''],
            type: 'article',
        },
        alternates: {
            canonical: post.canonicalUrl || `https://lakembamobileking.com.au/blog/${post.slug}`,
        }
    };
}

async function getPost(slug: string) {
    const [post] = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImageUrl: blogPosts.featuredImageUrl,
        publishedAt: blogPosts.publishedAt,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        canonicalUrl: blogPosts.canonicalUrl,
        ogTitle: blogPosts.ogTitle,
        ogDescription: blogPosts.ogDescription,
        ogImageUrl: blogPosts.ogImageUrl,
        categoryId: blogPosts.categoryId,
        category: {
            name: blogCategories.name,
            slug: blogCategories.slug
        },
        author: {
            name: admins.name
        }
    })
        .from(blogPosts)
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .leftJoin(admins, eq(blogPosts.authorId, admins.id))
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
        .limit(1);

    return post;
}

async function getRelatedPosts(categoryId: number, currentPostId: number) {
    return await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        featuredImageUrl: blogPosts.featuredImageUrl,
        publishedAt: blogPosts.publishedAt
    })
        .from(blogPosts)
        .where(and(
            eq(blogPosts.categoryId, categoryId),
            ne(blogPosts.id, currentPostId),
            eq(blogPosts.status, 'published')
        ))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(3);
}

export default async function BlogDetailPage({ params }: PageProps) {
    const post = await getPost(params.slug);
    if (!post) notFound();

    const relatedPosts = post.categoryId ? await getRelatedPosts(post.categoryId, post.id) : [];

    // JSON-LD for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.featuredImageUrl,
        datePublished: post.publishedAt?.toISOString(),
        author: {
            '@type': 'Person',
            name: post.author?.name || 'Lakemba Mobile King',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Lakemba Mobile King',
            logo: {
                '@type': 'ImageObject',
                url: 'https://lakembamobileking.com.au/logo.png',
            },
        },
        description: post.excerpt,
    };

    return (
        <article className="min-h-screen bg-white pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Post Header */}
            <header className="relative pt-32 pb-20 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={post.featuredImageUrl || '/images/blog-placeholder.jpg'}
                        alt=""
                        className="w-full h-full object-cover opacity-20 blur-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft size={16} /> Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30 text-xs font-bold tracking-widest uppercase mb-6">
                            {post.category?.name}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 text-gray-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                    {post.author?.name?.charAt(0) || 'L'}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">{post.author?.name || 'Lakemba Staff'}</p>
                                    <p className="text-xs">Author</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-brand-yellow" />
                                {post.publishedAt?.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock size={16} className="text-brand-yellow" />
                                5 min read
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Post Content */}
            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Content */}
                    <main className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100">
                        {post.featuredImageUrl && (
                            <img
                                src={post.featuredImageUrl}
                                alt={post.title}
                                className="w-full h-auto rounded-2xl mb-12 shadow-lg"
                            />
                        )}

                        <div
                            className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-2xl"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />

                        {/* Social Share */}
                        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="font-bold text-gray-900">Share this article</p>
                            <div className="flex gap-4">
                                <button className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-brand-blue hover:text-white transition-all">
                                    <Facebook size={20} />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-all">
                                    <Twitter size={20} />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-all">
                                    <LinkIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </main>

                    {/* Right: Sidebar */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* Table of Contents - Optional logic would go here */}
                        <div className="bg-gray-50 rounded-3xl p-8 sticky top-32 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen size={20} className="text-brand-blue" />
                                <h3 className="font-bold text-xl">Quick Info</h3>
                            </div>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex items-start gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5"></div>
                                    Expert verified repair guides.
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5"></div>
                                    Genuine parts used for all mentions.
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5"></div>
                                    Visit us 7 days a week at Lakemba.
                                </li>
                            </ul>

                            <Link
                                href="/book-repair"
                                className="mt-8 block w-full bg-brand-blue text-white text-center py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-brand-blue/20"
                            >
                                Book a Repair Now
                            </Link>
                        </div>

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-xl px-4 flex items-center justify-between">
                                    Related Posts
                                    <Link href="/blog" className="text-xs text-brand-blue hover:underline">View All</Link>
                                </h3>
                                <div className="space-y-4">
                                    {relatedPosts.map((rp) => (
                                        <Link
                                            key={rp.id}
                                            href={`/blog/${rp.slug}`}
                                            className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-50 hover:border-brand-blue/30 hover:shadow-lg transition-all"
                                        >
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={rp.featuredImageUrl || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-brand-blue transition-colors">
                                                    {rp.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                                                    {new Date(rp.publishedAt!).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </article>
    );
}
