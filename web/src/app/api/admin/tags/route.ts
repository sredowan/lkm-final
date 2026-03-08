import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { globalTags } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const allTags = await db.select()
            .from(globalTags)
            .orderBy(asc(globalTags.name));

        return NextResponse.json(allTags);
    } catch (error: any) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
