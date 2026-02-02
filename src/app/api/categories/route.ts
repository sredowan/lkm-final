import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const allCategories = await db.select().from(categories);
        return NextResponse.json(allCategories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const result = await db.insert(categories).values(body);
        const insertId = (result as any)[0].insertId;
        return NextResponse.json({ success: true, id: insertId }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create category', details: error }, { status: 500 });
    }
}
