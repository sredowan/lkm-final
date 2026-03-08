import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, blogCategories, blogTags, blogPostTags } from '@/db/schema';
import { desc, like, eq, and, or, count, sql, inArray } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const categoryId = searchParams.get('categoryId');

        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(blogPosts.title, `%${search}%`),
                    like(blogPosts.slug, `%${search}%`)
                )
            );
        }

        if (categoryId && categoryId !== 'all') {
            conditions.push(eq(blogPosts.categoryId, parseInt(categoryId)));
        }

        if (status !== 'all') {
            conditions.push(eq(blogPosts.status, status));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [countResult] = await db.select({ count: count() }).from(blogPosts).where(whereClause);
        const total = Number(countResult?.count) || 0;

        const offset = (page - 1) * pageSize;
        const posts = await db
            .select({
                id: blogPosts.id,
                title: blogPosts.title,
                slug: blogPosts.slug,
                status: blogPosts.status,
                viewCount: blogPosts.viewCount,
                updatedAt: blogPosts.updatedAt,
                category: {
                    name: blogCategories.name
                }
            })
            .from(blogPosts)
            .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
            .where(whereClause)
            .orderBy(desc(blogPosts.createdAt))
            .limit(pageSize)
            .offset(offset);

        return NextResponse.json({
            posts,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error: any) {
        console.error('Error fetching admin blogs:', error);
        return NextResponse.json({
            error: 'Failed to fetch blogs',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const authorId = parseInt(session.user?.id as string);

        const result = await db.insert(blogPosts).values({
            title: body.title,
            slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            excerpt: body.excerpt || null,
            content: body.content || null,
            featuredImageUrl: body.featuredImageUrl || null,
            categoryId: body.categoryId || null,
            authorId: authorId,
            status: body.status || 'draft',
            publishedAt: body.status === 'published' ? new Date() : null,
            metaTitle: body.metaTitle || null,
            metaDescription: body.metaDescription || null,
            canonicalUrl: body.canonicalUrl || null,
            focusKeyword: body.focusKeyword || null,
            secondaryKeywords: body.secondaryKeywords ? JSON.stringify(body.secondaryKeywords) : null,
            ogTitle: body.ogTitle || null,
            ogDescription: body.ogDescription || null,
            ogImageUrl: body.ogImageUrl || null,
        });

        const postId = result[0].insertId;

        // Handle tags
        if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
            for (const tagName of body.tags) {
                const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                // Ensure tag exists
                await db.insert(blogTags).values({
                    name: tagName,
                    slug: tagSlug
                }).onDuplicateKeyUpdate({ set: { name: tagName } });

                const [tag] = await db.select().from(blogTags).where(eq(blogTags.slug, tagSlug)).limit(1);

                if (tag) {
                    await db.insert(blogPostTags).values({
                        postId: postId,
                        tagId: tag.id
                    });
                }
            }
        }

        return NextResponse.json({ success: true, id: postId });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
