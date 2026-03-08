import { db } from "../src/db/index";
import { blogCategories, blogPosts, blogTags, blogPostTags, admins } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("Seeding blog data...");

    try {
        // 1. Ensure we have an admin
        const [admin] = await db.select().from(admins).limit(1);
        if (!admin) {
            console.error("No admin found. Please run seed-admin.js first.");
            return;
        }

        // 2. Add Categories
        const categories = [
            { name: "Tech News", slug: "tech-news" },
            { name: "Repair Guides", slug: "repair-guides" },
            { name: "Buying Tips", slug: "buying-tips" },
            { name: "Store Updates", slug: "store-updates" }
        ];

        for (const cat of categories) {
            await db.insert(blogCategories).values(cat).onDuplicateKeyUpdate({ set: { name: cat.name } });
        }
        console.log("Categories seeded.");

        const seededCats = await db.select().from(blogCategories);

        // 3. Add Tags
        const tags = ["Apple", "Samsung", "Repair", "Screen", "Battery", "Tips", "2026"];
        for (const tagName of tags) {
            const slug = tagName.toLowerCase();
            await db.insert(blogTags).values({ name: tagName, slug }).onDuplicateKeyUpdate({ set: { name: tagName } });
        }
        console.log("Tags seeded.");

        const seededTags = await db.select().from(blogTags);

        // 4. Add Posts
        const posts = [
            {
                title: "How to Extend Your iPhone Battery Life",
                slug: "extend-iphone-battery-life",
                excerpt: "Learn the top 10 tips to keep your iPhone running all day long.",
                content: "<h2>1. Low Power Mode</h2><p>Always use low power mode when your battery is below 20%...</p><h2>2. Background App Refresh</h2><p>Disable background app refresh for apps you don't use often...</p>",
                featuredImageUrl: "https://images.unsplash.com/photo-1556656793-062ff9878258",
                status: "published",
                categoryId: seededCats[0].id,
                authorId: admin.id,
                metaTitle: "Tips to Extend iPhone Battery Life | Lakemba Mobile King",
                metaDescription: "Check out these practical tips to improve your iPhone battery health and daily life.",
                publishedAt: new Date()
            },
            {
                title: "iPhone 16 Screen Repair Guide",
                slug: "iphone-16-screen-repair-guide",
                excerpt: "A step-by-step overview of what to expect when repairing your iPhone 16 screen.",
                content: "<h2>Introduction</h2><p>The iPhone 16 features a more durable screen, but it's not unbreakable...</p><p>We use genuine parts for all repairs.</p>",
                featuredImageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
                status: "published",
                categoryId: seededCats[1].id,
                authorId: admin.id,
                publishedAt: new Date()
            }
        ];

        for (const post of posts) {
            console.log(`Seeding post: ${post.title}`);
            const insertResult = await db.insert(blogPosts).values(post).onDuplicateKeyUpdate({ set: { title: post.title } });

            let postId = (insertResult as any)[0]?.insertId;

            // If update occurred, insertId might be 0, so we fetch by slug
            if (!postId || postId === 0) {
                const [existing] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, post.slug));
                postId = existing?.id;
            }

            // Link tags to posts
            if (postId) {
                const postTags = post.slug.includes("battery")
                    ? [seededTags[0], seededTags[4]]
                    : [seededTags[0], seededTags[2]];

                for (const t of postTags) {
                    await db.insert(blogPostTags).values({
                        postId: Number(postId),
                        tagId: t.id
                    }).onDuplicateKeyUpdate({ set: { postId: Number(postId) } });
                }
            }
        }
        console.log("Posts seeded.");

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
