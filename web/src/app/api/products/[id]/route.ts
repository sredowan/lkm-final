import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants, productImages, categories } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Try to find by slug first, then by ID for backwards compatibility
        let product;

        // Check if the parameter is a number (ID) or string (slug)
        const isNumeric = /^\d+$/.test(params.id);

        if (isNumeric) {
            // Legacy ID-based lookup for backwards compatibility
            product = await db.query.products.findFirst({
                where: eq(products.id, parseInt(params.id)),
            });
        } else {
            // Slug-based lookup
            product = await db.query.products.findFirst({
                where: eq(products.slug, params.id),
            });
        }

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Fetch category name
        let categoryName = null;
        if (product.categoryId) {
            const category = await db.query.categories.findFirst({
                where: eq(categories.id, product.categoryId),
            });
            categoryName = category?.name || null;
        }

        // Fetch variants
        let variants: any[] = [];
        try {
            variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));
        } catch (e) {
            console.warn('Could not fetch variants:', e);
        }

        // Fetch images
        let images: any[] = [];
        try {
            images = await db.select().from(productImages).where(eq(productImages.productId, product.id));
        } catch (e) {
            console.warn('Could not fetch images:', e);
        }

        return NextResponse.json({
            ...product,
            categoryName,
            variants,
            images
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Error fetching product" },
            { status: 500 }
        );
    }
}
