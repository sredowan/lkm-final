import { db } from '@/db';
import { brands, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ShopLandingClient from "@/components/shop/ShopLandingClient";
import { brandData } from '@/db/brand-data';

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    let initialBrands = [];

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

        if (initialBrands.length === 0) {
            // Fallback to static data if DB is empty
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
        <ShopLandingClient initialBrands={initialBrands} />
    );
}
