import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants, categories } from '@/db/schema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get('category');
        const brandSlug = searchParams.get('brand');

        let categoryId = null;
        if (categorySlug) {
            const category = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
            if (category.length > 0) {
                categoryId = category[0].id;
            }
        }

        // Base query conditions
        const conditions = [eq(products.isActive, true)];
        if (categoryId) {
            conditions.push(eq(products.categoryId, categoryId));
        }
        if (brandSlug) {
            // If filtering by brand, we might still want to see other brands contextually? 
            // Usually Facets should show what's available in the current *scope*.
            // If I am in "Apple" brand view, I probably don't need to see "Samsung" in filters unless I want to switch?
            // But if I am in "Mobile Phone" category, I want to see all brands that make mobile phones.
            // If I have both selected, facets usually respect the *other* filters.
            // For simplicity, Facets usually respect Category, but might ignore Brand/Price when calculating Brand counts to allow broadening.
            // Let's behave like: Facets are based on Category + Search Term (if any).
        }

        const whereClause = and(...conditions);

        // 1. Get Brands in this scope
        const brandsResult = await db.select({
            brand: products.brand,
            count: sql<number>`count(*)`
        })
            .from(products)
            .where(whereClause)
            .groupBy(products.brand);

        const availableBrands = brandsResult.map(b => b.brand).filter(Boolean);

        // 2. Get Conditions in this scope
        const conditionsResult = await db.select({
            condition: products.condition,
            count: sql<number>`count(*)`
        })
            .from(products)
            .where(whereClause)
            .groupBy(products.condition);

        const availableConditions = conditionsResult.map(c => c.condition).filter(Boolean);

        // 3. Get Price Range in this scope
        const priceResult = await db.select({
            minPrice: sql<number>`min(${products.price})`,
            maxPrice: sql<number>`max(${products.price})`
        })
            .from(products)
            .where(whereClause);

        const priceRange = {
            min: Number(priceResult[0]?.minPrice) || 0,
            max: Number(priceResult[0]?.maxPrice) || 10000
        };

        // 4. Get Storage options (Requires join with variants)
        // We need products that match the base criteria, then find their variants' storage
        const storageResult = await db.select({
            storage: productVariants.storage
        })
            .from(productVariants)
            .innerJoin(products, eq(productVariants.productId, products.id))
            .where(whereClause)
            .groupBy(productVariants.storage);

        const availableStorage = storageResult.map(s => s.storage).filter(Boolean).sort((a, b) => {
            // Simple clean sort for storage if possible (GB/TB logic is hard, string sort is okay for now)
            return (a || '').localeCompare(b || '');
        });


        return NextResponse.json({
            brands: availableBrands,
            conditions: availableConditions,
            storage: availableStorage,
            priceRange
        });

    } catch (error) {
        console.error("Failed to fetch facets:", error);
        return NextResponse.json({ error: 'Failed to fetch facets' }, { status: 500 });
    }
}
