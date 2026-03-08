import { db } from "../src/db/index";
import { blogPosts, blogCategories, blogTags, blogPostTags } from "../src/db/schema";
import { sql } from "drizzle-orm";

async function check() {
    console.log("Checking blog tables...");
    try {
        const tables = ["blog_categories", "blog_posts", "blog_tags", "blog_post_tags"];
        for (const table of tables) {
            try {
                const result = await db.execute(sql.raw(`DESCRIBE ${table}`));
                console.log(`Table ${table} exists.`);
            } catch (e) {
                console.error(`Table ${table} does NOT exist or error accessing it.`);
            }
        }

        const postsCount = await db.select({ count: sql`count(*)` }).from(blogPosts);
        console.log("Blog posts count:", postsCount[0]);

    } catch (error) {
        console.error("Check failed:", error);
    }
    process.exit(0);
}

check();
