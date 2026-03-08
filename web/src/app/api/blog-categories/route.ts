import { db } from "@/db";
import { blogCategories } from "@/db/schema";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const categories = await db.select()
            .from(blogCategories)
            .orderBy(asc(blogCategories.name));

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching blog categories:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
