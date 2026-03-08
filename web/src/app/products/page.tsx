import { db } from '@/db';
import { brands, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ProductsClient from "@/components/shop/ProductsClient";
import { brandData } from '@/db/brand-data';

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    let initialBrands = [];
    let initialCategories = [];

    try {
        // Fetch active brands from database
        const dbBrands = await db.select().from(brands).where(eq(brands.isActive, true));

        // Use DB data if available, otherwise might need seeding/fallback
        initialBrands = dbBrands.sort((a, b) => { // @ts-ignore
            if (a.isPopular !== b.isPopular) { // @ts-ignore
                return a.isPopular ? -1 : 1;
            }
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        // Fetch categories (tree structure)
        const allCats = await db.select().from(categories).where(eq(categories.isActive, true));
        const categoryMap = new Map();
        const rootCategories: any[] = [];

        allCats.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        allCats.forEach(cat => {
            const categoryWithChildren = categoryMap.get(cat.id);
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(categoryWithChildren);
                }
            } else {
                rootCategories.push(categoryWithChildren);
            }
        });
        initialCategories = rootCategories;

        if (initialBrands.length === 0) {
            // Fallback to static data if DB is empty (similar to API error handling)
            initialBrands = brandData.map((b, index) => ({
                ...b,
                id: index + 1, // Placeholder unique ID
                logo: b.logo,
                isPopular: b.isPopular ?? false,
                isActive: true,
                sortOrder: b.sortOrder ?? 0
            }));
        }
    } catch (error) {
        console.error("Failed to fetch initial data server-side:", error);
        // Fallback to static data on error
        initialBrands = brandData.map((b, index) => ({
            ...b,
            id: index + 1, // Placeholder unique ID
            logo: b.logo,
            isPopular: b.isPopular ?? false,
            isActive: true,
            sortOrder: b.sortOrder ?? 0
        }));
    }

    return (
        <ProductsClient initialBrands={initialBrands} initialCategories={initialCategories} />
    );
}
