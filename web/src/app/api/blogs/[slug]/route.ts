import { db } from "@/db";
import { blogPosts, blogCategories, blogPostTags, blogTags, admins } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const [post] = await db.select({
            id: blogPosts.id,
            title: blogPosts.title,
            slug: blogPosts.slug,
            excerpt: blogPosts.excerpt,
            content: blogPosts.content,
            featuredImageUrl: blogPosts.featuredImageUrl,
            publishedAt: blogPosts.publishedAt,
            viewCount: blogPosts.viewCount,
            metaTitle: blogPosts.metaTitle,
            metaDescription: blogPosts.metaDescription,
            canonicalUrl: blogPosts.canonicalUrl,
            ogTitle: blogPosts.ogTitle,
            ogDescription: blogPosts.ogDescription,
            ogImageUrl: blogPosts.ogImageUrl,
            category: {
                id: blogCategories.id,
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

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Increment view count asynchronously
        db.update(blogPosts)
            .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
            .where(eq(blogPosts.id, post.id))
            .execute();

        // Fetch tags
        const tags = await db.select({
            id: blogTags.id,
            name: blogTags.name,
            slug: blogTags.slug
        })
            .from(blogPostTags)
            .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
            .where(eq(blogPostTags.postId, post.id));

        return NextResponse.json({ ...post, tags });
    } catch (error) {
        console.error("Error fetching blog detail:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
