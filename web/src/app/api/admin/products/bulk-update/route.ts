import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, globalTags } from '@/db/schema';
import { inArray, sql, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { ids, action, value } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
        }

        if (!action) {
            return NextResponse.json({ error: 'No action specified' }, { status: 400 });
        }

        let updateCount = 0;

        switch (action) {
            case 'setPrice':
                // Set a fixed price for all selected products
                if (value === undefined || value === null || isNaN(Number(value))) {
                    return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
                }
                await db.update(products)
                    .set({ price: String(value) })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'adjustPricePercent':
                // Increase or decrease price by percentage
                // value can be positive (increase) or negative (decrease)
                if (value === undefined || value === null || isNaN(Number(value))) {
                    return NextResponse.json({ error: 'Invalid percentage value' }, { status: 400 });
                }
                const multiplier = 1 + (Number(value) / 100);
                await db.update(products)
                    .set({
                        price: sql`ROUND(${products.price} * ${multiplier}, 2)`
                    })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'setCategory':
                // Change category for all selected products
                const categoryId = value === null || value === '' ? null : Number(value);
                await db.update(products)
                    .set({ categoryId })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'setStock':
                // Set stock quantity for all selected products
                if (value === undefined || value === null || isNaN(Number(value)) || Number(value) < 0) {
                    return NextResponse.json({ error: 'Invalid stock value' }, { status: 400 });
                }
                await db.update(products)
                    .set({ stock: Number(value) })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'adjustStock':
                // Increase or decrease stock by a fixed amount
                // value can be positive (add) or negative (subtract)
                if (value === undefined || value === null || isNaN(Number(value))) {
                    return NextResponse.json({ error: 'Invalid stock adjustment value' }, { status: 400 });
                }
                await db.update(products)
                    .set({
                        stock: sql`GREATEST(0, ${products.stock} + ${Number(value)})`
                    })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'setActive':
                // Set active status for all selected products
                const isActive = value === true || value === 'true' || value === 1;
                await db.update(products)
                    .set({ isActive })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'setFeatured':
                // Set featured status for all selected products
                const isFeatured = value === true || value === 'true' || value === 1;
                await db.update(products)
                    .set({ isFeatured })
                    .where(inArray(products.id, ids));
                updateCount = ids.length;
                break;

            case 'addTags':
                // Add specific tags to all selected products
                if (!value || typeof value !== 'string') {
                    return NextResponse.json({ error: 'Invalid tags value' }, { status: 400 });
                }
                const newTagsToAdd = value.split(',').map(t => t.trim()).filter(Boolean);
                if (newTagsToAdd.length === 0) {
                    return NextResponse.json({ error: 'No valid tags provided' }, { status: 400 });
                }

                // We need to fetch each product to merge tags
                const productsToUpdateAdd = await db.select({ id: products.id, tags: products.tags })
                    .from(products)
                    .where(inArray(products.id, ids));

                for (const product of productsToUpdateAdd) {
                    const currentTags = product.tags ? product.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                    const updatedTags = Array.from(new Set([...currentTags, ...newTagsToAdd]));
                    await db.update(products)
                        .set({ tags: updatedTags.join(', ') })
                        .where(eq(products.id, product.id));
                }

                // Also sync with global tags
                for (const tag of newTagsToAdd) {
                    try {
                        await db.insert(globalTags).values({ name: tag }).onDuplicateKeyUpdate({ set: { name: tag } });
                    } catch (e) { /* Ignore */ }
                }

                updateCount = ids.length;
                break;

            case 'removeTags':
                // Remove specific tags from all selected products
                if (!value || typeof value !== 'string') {
                    return NextResponse.json({ error: 'Invalid tags value' }, { status: 400 });
                }
                const tagsToRemove = value.split(',').map(t => t.trim()).filter(Boolean);
                if (tagsToRemove.length === 0) {
                    return NextResponse.json({ error: 'No valid tags provided' }, { status: 400 });
                }

                const productsToUpdateRemove = await db.select({ id: products.id, tags: products.tags })
                    .from(products)
                    .where(inArray(products.id, ids));

                for (const product of productsToUpdateRemove) {
                    if (!product.tags) continue;
                    const currentTags = product.tags.split(',').map(t => t.trim()).filter(Boolean);
                    const updatedTags = currentTags.filter(t => !tagsToRemove.includes(t));
                    await db.update(products)
                        .set({ tags: updatedTags.length > 0 ? updatedTags.join(', ') : null })
                        .where(eq(products.id, product.id));
                }

                updateCount = ids.length;
                break;

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            updated: updateCount,
            action,
            message: `Successfully updated ${updateCount} product(s)`
        });
    } catch (error) {
        console.error('Error bulk updating products:', error);
        return NextResponse.json({ error: 'Failed to bulk update products' }, { status: 500 });
    }
}
