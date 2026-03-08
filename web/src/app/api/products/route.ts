import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants, productImages, categories } from '@/db/schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and, gte, lte, inArray, like, exists, or } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const brand = searchParams.get('brand');
        const categorySlug = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const condition = searchParams.get('condition');
        const storage = searchParams.get('storage'); // Comma separated
        const search = searchParams.get('search');
        const tags = searchParams.get('tags');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        let categoryId = null;
        if (categorySlug) {
            const category = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
            if (category.length > 0) {
                categoryId = category[0].id;
            }
        }

        const conditions = []; // Default active check or handled below

        if (brand) {
            conditions.push(eq(products.brand, brand));
        }
        if (categoryId) {
            conditions.push(eq(products.categoryId, categoryId));
        }
        if (minPrice) {
            conditions.push(gte(products.price, minPrice.toString()));
        }
        if (maxPrice) {
            conditions.push(lte(products.price, maxPrice.toString()));
        }
        if (condition) {
            // Handle multiple conditions if comma separated, e.g. "New,Used"
            if (condition.includes(',')) {
                conditions.push(inArray(products.condition, condition.split(',')));
            } else {
                conditions.push(eq(products.condition, condition));
            }
        }

        // Search filter (name, SKU, brand, tags)
        if (search) {
            conditions.push(
                or(
                    like(products.name, `%${search}%`),
                    like(products.sku, `%${search}%`),
                    like(products.brand, `%${search}%`),
                    like(products.tags, `%${search}%`)
                )
            );
        }

        // Tags filter (exact matches)
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
            if (tagList.length > 0) {
                const tagConditions = tagList.map(tag => like(products.tags, `%${tag}%`));
                conditions.push(and(...tagConditions));
            }
        }

        // Total count for pagination
        const totalResult = await db.select({ count: db.$count(products) }).from(products)
            .where(and(eq(products.isActive, true), ...conditions));
        const totalCount = totalResult[0]?.count || 0;

        const allProducts = await db.select().from(products)
            .where(and(eq(products.isActive, true), ...conditions))
            .limit(limit)
            .offset(offset);

        // Fetch variants for all products
        let allVariants: any[] = [];
        try {
            if (allProducts.length > 0) {
                const productIds = allProducts.map(p => p.id);
                allVariants = await db.select().from(productVariants).where(inArray(productVariants.productId, productIds));
            }
        } catch (e) {
            console.warn('Could not fetch variants:', e);
        }

        // Fetch images for all products
        let allImages: any[] = [];
        try {
            if (allProducts.length > 0) {
                const productIds = allProducts.map(p => p.id);
                allImages = await db.select().from(productImages).where(inArray(productImages.productId, productIds));
            }
        } catch (e) {
            console.warn('Could not fetch images:', e);
        }

        // Group variants by productId
        const variantsByProduct = allVariants.reduce((acc: any, variant: any) => {
            if (!acc[variant.productId]) {
                acc[variant.productId] = [];
            }
            acc[variant.productId].push(variant);
            return acc;
        }, {});

        // Group images by productId and find primary image
        const imagesByProduct = allImages.reduce((acc: any, image: any) => {
            if (!acc[image.productId]) {
                acc[image.productId] = [];
            }
            acc[image.productId].push(image);
            return acc;
        }, {});

        // Add variants and primary image to each product
        const productsWithData = allProducts.map(product => {
            const images = imagesByProduct[product.id] || [];
            const primaryImage = images.find((img: any) => img.isPrimary) || images[0];

            return {
                ...product,
                variants: variantsByProduct[product.id] || [],
                primaryImage: primaryImage?.imageUrl || null
            };
        });

        return NextResponse.json({
            products: productsWithData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const result = await db.insert(products).values(body);
        const insertId = (result as any)[0].insertId;

        return NextResponse.json({ success: true, id: insertId }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
