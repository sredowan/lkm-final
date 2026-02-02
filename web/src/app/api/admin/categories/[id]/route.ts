import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET single category
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);

        const [category] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Get subcategories
        const subcategories = await db.select().from(categories).where(eq(categories.parentId, categoryId));

        return NextResponse.json({ category, subcategories });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

// UPDATE category
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);
        const body = await request.json();

        await db.update(categories).set({
            name: body.name,
            slug: body.slug,
            description: body.description || null,
            image: body.image || null,
            parentId: body.parentId || null,
            isActive: body.isActive ?? true,
        }).where(eq(categories.id, categoryId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE category
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);

        // Update products to remove category reference
        await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, categoryId));

        // Update subcategories to remove parent reference
        await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, categoryId));

        // Delete category
        await db.delete(categories).where(eq(categories.id, categoryId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
