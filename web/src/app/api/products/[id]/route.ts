import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, productVariants, productVariantOptions, variantTypes, variantOptions, productImages, categories } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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
            const results = await db.select().from(products).where(eq(products.id, parseInt(params.id))).limit(1);
            product = results[0];
        } else {
            // Slug-based lookup
            const results = await db.select().from(products).where(eq(products.slug, params.id)).limit(1);
            product = results[0];
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
            const results = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
            categoryName = results[0]?.name || null;
        }

        // Fetch variants with their options and types
        let variants: any[] = [];
        let applicableVariantTypes: any[] = [];
        try {
            const rawVariants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id));

            if (rawVariants.length > 0) {
                const variantIds = rawVariants.map(v => v.id);

                // Fetch ALL linked options for ALL variants in one query
                const allLinkedOptions = await db.select({
                    variantId: productVariantOptions.variantId,
                    optionId: productVariantOptions.optionId,
                    optionValue: variantOptions.value,
                    typeId: variantOptions.typeId,
                    typeName: variantTypes.name
                })
                    .from(productVariantOptions)
                    .innerJoin(variantOptions, eq(productVariantOptions.optionId, variantOptions.id))
                    .innerJoin(variantTypes, eq(variantOptions.typeId, variantTypes.id))
                    .where(inArray(productVariantOptions.variantId, variantIds));

                // Map options back to variants
                variants = rawVariants.map(v => ({
                    ...v,
                    options: allLinkedOptions.filter(lo => lo.variantId === v.id)
                }));

                // Get unique type IDs from the options
                const uniqueTypeIds = [...new Set(allLinkedOptions.map(lo => lo.typeId))];

                if (uniqueTypeIds.length > 0) {
                    // Fetch all applicable variant types
                    const types = await db.select().from(variantTypes).where(inArray(variantTypes.id, uniqueTypeIds));

                    // Fetch options for each type to build the UI selectors
                    applicableVariantTypes = await Promise.all(types.map(async (type) => {
                        const options = await db.select().from(variantOptions).where(eq(variantOptions.typeId, type.id));
                        return {
                            ...type,
                            options
                        };
                    }));
                }
            }
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
            variantTypes: applicableVariantTypes,
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
