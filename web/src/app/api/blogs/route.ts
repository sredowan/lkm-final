import { db } from "@/db";
import { blogPosts, blogCategories, blogPostTags, blogTags } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, like, desc, sql, or } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
        let conditions: any[] = [eq(blogPosts.status, 'published')];

        if (categoryId) {
            conditions.push(eq(blogPosts.categoryId, parseInt(categoryId)));
        }

        if (search) {
            conditions.push(or(
                like(blogPosts.title, `%${search}%`),
                like(blogPosts.excerpt, `%${search}%`)
            ));
        }

        const posts = await db.select({
            id: blogPosts.id,
            title: blogPosts.title,
            slug: blogPosts.slug,
            excerpt: blogPosts.excerpt,
            featuredImageUrl: blogPosts.featuredImageUrl,
            publishedAt: blogPosts.publishedAt,
            viewCount: blogPosts.viewCount,
            category: {
                id: blogCategories.id,
                name: blogCategories.name,
                slug: blogCategories.slug
            }
        })
            .from(blogPosts)
            .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
            .where(and(...conditions as any[]))
            .orderBy(desc(blogPosts.publishedAt))
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        const [countResult] = await db.select({
            count: sql<number>`count(*)`
        })
            .from(blogPosts)
            .where(and(...conditions));

        return NextResponse.json({
            posts,
            total: countResult?.count || 0
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
