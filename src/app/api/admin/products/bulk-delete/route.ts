import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages } from '@/db/schema';
import { inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
        }

        // Delete associated images first
        await db.delete(productImages).where(inArray(productImages.productId, ids));

        // Delete products
        await db.delete(products).where(inArray(products.id, ids));

        return NextResponse.json({ success: true, deleted: ids.length });
    } catch (error) {
        console.error('Error deleting products:', error);
        return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 });
    }
}
