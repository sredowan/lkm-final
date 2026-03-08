import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tree = searchParams.get('tree') === 'true';

        const allCategories = await db.select().from(categories);

        if (tree) {
            // Build tree structure
            const categoryMap = new Map();
            const rootCategories: any[] = [];

            // First pass: create map
            allCategories.forEach(cat => {
                categoryMap.set(cat.id, { ...cat, children: [] });
            });

            // Second pass: build tree
            allCategories.forEach(cat => {
                const categoryWithChildren = categoryMap.get(cat.id);
                if (cat.parentId) {
                    const parent = categoryMap.get(cat.parentId);
                    if (parent) {
                        parent.children.push(categoryWithChildren);
                    }
                } else {
                    rootCategories.push(categoryWithChildren);
                }
            });

            return NextResponse.json(rootCategories);
        }

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
