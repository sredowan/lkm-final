import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { desc, eq, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET all categories (with optional tree structure)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const tree = searchParams.get('tree') === 'true';

        const allCategories = await db.select().from(categories).orderBy(desc(categories.createdAt));

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
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await db.insert(categories).values({
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: body.description || null,
            image: body.image || null,
            parentId: body.parentId || null,
            isActive: body.isActive ?? true,
        });

        return NextResponse.json({ success: true, id: result[0].insertId });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
