import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, productVariants, productImages, categories } from '@/db/schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and, gte, lte, inArray, like, exists } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const brand = searchParams.get('brand');
        const categorySlug = searchParams.get('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const condition = searchParams.get('condition');
        const storage = searchParams.get('storage'); // Comma separated if multiple? Assuming single for now or multiple handled

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

        // Storage filtering requires checking variants
        if (storage) {
            // Subquery to find product IDs that have variants with formatted storage
            // This is a bit complex with drizzle-orm raw SQL vs query builder.
            // We'll use exists or inArray with a subquery if possible, or join.
            // For simplicity with this ORM setup, let's filter after fetch if performance is ok (small catalog) 
            // OR use a `where exists` clause.
            const storageList = storage.split(',');

            // Using exists with a correlated subquery is ideal but complex in simple Drizzle.
            // Let's filter products where ID is in a list of IDs that match storage.
            const matchingVariantProducts = await db.select({ productId: productVariants.productId })
                .from(productVariants)
                .where(inArray(productVariants.storage, storageList));

            const matchingIds = matchingVariantProducts.map(v => v.productId);
            if (matchingIds.length > 0) {
                conditions.push(inArray(products.id, matchingIds));
            } else {
                // No products match storage, return empty immediately
                return NextResponse.json([]);
            }
        }

        const allProducts = await db.select().from(products)
            .where(and(eq(products.isActive, true), ...conditions));


        // Fetch variants for all products
        let allVariants: any[] = [];
        try {
            allVariants = await db.select().from(productVariants);
        } catch (e) {
            console.warn('Could not fetch variants:', e);
        }

        // Fetch images for all products
        let allImages: any[] = [];
        try {
            allImages = await db.select().from(productImages);
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

        return NextResponse.json(productsWithData);
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
