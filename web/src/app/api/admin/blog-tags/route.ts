import { db } from "@/db";
import { blogTags } from "@/db/schema";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const tags = await db.select().from(blogTags).orderBy(asc(blogTags.name));
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
