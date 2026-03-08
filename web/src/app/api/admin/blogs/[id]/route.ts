import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts, blogTags, blogPostTags } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const postId = parseInt(id);

        const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Fetch tags
        const tags = await db.select({
            id: blogTags.id,
            name: blogTags.name,
            slug: blogTags.slug
        })
            .from(blogPostTags)
            .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
            .where(eq(blogPostTags.postId, postId));

        return NextResponse.json({ ...post, tags });
    } catch (error) {
        console.error('Error fetching admin blog:', error);
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const postId = parseInt(id);
        const body = await request.json();

        const [existingPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1);
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Set publishedAt if status changed to published
        let publishedAt = existingPost.publishedAt;
        if (body.status === 'published' && existingPost.status !== 'published') {
            publishedAt = new Date();
        }

        await db.update(blogPosts).set({
            title: body.title,
            slug: body.slug,
            excerpt: body.excerpt || null,
            content: body.content || null,
            featuredImageUrl: body.featuredImageUrl || null,
            categoryId: body.categoryId || null,
            status: body.status || 'draft',
            publishedAt: publishedAt,
            metaTitle: body.metaTitle || null,
            metaDescription: body.metaDescription || null,
            canonicalUrl: body.canonicalUrl || null,
            focusKeyword: body.focusKeyword || null,
            secondaryKeywords: body.secondaryKeywords ? JSON.stringify(body.secondaryKeywords) : null,
            ogTitle: body.ogTitle || null,
            ogDescription: body.ogDescription || null,
            ogImageUrl: body.ogImageUrl || null,
            updatedAt: new Date(),
        }).where(eq(blogPosts.id, postId));

        // Handle tags
        if (body.tags && Array.isArray(body.tags)) {
            // Remove old tags
            await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));

            // Insert new tags
            for (const tagName of body.tags) {
                const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const postId = parseInt(id);

        // Delete tag associations
        await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));

        // Delete post
        await db.delete(blogPosts).where(eq(blogPosts.id, postId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
