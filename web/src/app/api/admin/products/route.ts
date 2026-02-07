import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productImages, productVariants } from '@/db/schema';
import { desc, like, eq, and, or, lte, count, sql, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const categoryId = searchParams.get('categoryId');

        // Build where conditions
        const conditions = [];

        // Search filter
        if (search) {
            conditions.push(
                or(
                    like(products.name, `%${search}%`),
                    like(products.sku, `%${search}%`),
                    like(products.brand, `%${search}%`)
                )
            );
        }

        // Category filter
        if (categoryId && categoryId !== 'all') {
            conditions.push(eq(products.categoryId, parseInt(categoryId)));
        }

        // Status filter
        if (status === 'active') {
            conditions.push(eq(products.isActive, true));
        } else if (status === 'inactive') {
            conditions.push(eq(products.isActive, false));
        } else if (status === 'lowStock') {
            conditions.push(and(lte(products.stock, 10), sql`${products.stock} > 0`));
        } else if (status === 'outOfStock') {
            conditions.push(eq(products.stock, 0));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const [countResult] = await db.select({ count: count() }).from(products).where(whereClause);
        const total = Number(countResult?.count) || 0;

        // Get paginated products
        const offset = (page - 1) * pageSize;
        const allProducts = await db
            .select()
            .from(products)
            .where(whereClause)
            .orderBy(desc(products.createdAt))
            .limit(pageSize)
            .offset(offset);

        // Get primary images for products
        const productIds = allProducts.map(p => p.id);
        let images: any[] = [];
        if (productIds.length > 0) {
            images = await db
                .select()
                .from(productImages)
                .where(and(
                    eq(productImages.isPrimary, true),
                    inArray(productImages.productId, productIds)
                ));
        }

        // Map images to products
        const imageMap = new Map(images.map(img => [img.productId, img.imageUrl]));
        const productsWithImages = allProducts.map(product => ({
            ...product,
            primaryImage: imageMap.get(product.id) || null,
        }));

        return NextResponse.json({
            products: productsWithImages,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await db.insert(products).values({
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            sku: body.sku || null,
            description: body.description || null,
            shortDescription: body.shortDescription || null,
            price: body.price,
            comparePrice: body.comparePrice || null,
            cost: body.cost || null,
            categoryId: body.categoryId || null,
            brand: body.brand || null,
            condition: body.condition || 'new',
            stock: body.stock || 0,
            isActive: body.isActive ?? true,
            isFeatured: body.isFeatured ?? false,
            metaTitle: body.metaTitle || null,
            metaDescription: body.metaDescription || null,
        });

        const productId = result[0].insertId;

        // Handle images if provided
        if (body.images && Array.isArray(body.images) && body.images.length > 0) {
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

        // Handle variants if provided
        if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
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

        return NextResponse.json({ success: true, id: productId });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
