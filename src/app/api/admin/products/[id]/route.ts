import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages, productVariants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET single product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productId = parseInt(id);

        const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const images = await db.select().from(productImages).where(eq(productImages.productId, productId));

        // Try to fetch variants, gracefully handle if table doesn't exist
        let variants: any[] = [];
        try {
            variants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
        } catch (variantError) {
            console.warn('Could not fetch variants (table may not exist yet):', variantError);
        }

        return NextResponse.json({ product, images, variants });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

// UPDATE product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productId = parseInt(id);
        const body = await request.json();

        // Update product
        await db.update(products).set({
            name: body.name,
            slug: body.slug,
            sku: body.sku || null,
            description: body.description || null,
            shortDescription: body.shortDescription || null,
            price: body.price,
            comparePrice: body.comparePrice || null,
            cost: body.cost || null,
            categoryId: body.categoryId || null,
            brand: body.brand || null,
            condition: body.condition || null,
            stock: body.stock || 0,
            isActive: body.isActive ?? true,
            isFeatured: body.isFeatured ?? false,
            metaTitle: body.metaTitle || null,
            metaDescription: body.metaDescription || null,
        }).where(eq(products.id, productId));

        // Handle images if provided
        if (body.images && Array.isArray(body.images)) {
            // Delete existing images
            await db.delete(productImages).where(eq(productImages.productId, productId));

            // Insert new images
            if (body.images.length > 0) {
                await db.insert(productImages).values(
                    body.images.map((img: any, index: number) => ({
                        productId,
                        imageUrl: img.imageUrl,
                        altText: img.altText || null,
                        isPrimary: img.isPrimary || index === 0,
                        sortOrder: index,
                    }))
                );
            }
        }

        // Handle variants if provided
        if (body.variants && Array.isArray(body.variants)) {
            // Delete existing variants
            await db.delete(productVariants).where(eq(productVariants.productId, productId));

            // Insert new variants
            if (body.variants.length > 0) {
                await db.insert(productVariants).values(
                    body.variants.map((v: any) => ({
                        productId,
                        color: v.color || null,
                        storage: v.storage || null,
                        sku: v.sku || null,
                        price: v.price || null,
                        comparePrice: v.comparePrice || null,
                        stock: v.stock || 0,
                        isActive: v.isActive ?? true,
                    }))
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productId = parseInt(id);

        // Delete images first
        await db.delete(productImages).where(eq(productImages.productId, productId));

        // Delete product
        await db.delete(products).where(eq(products.id, productId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
