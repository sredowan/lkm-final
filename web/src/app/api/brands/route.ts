import { NextResponse } from 'next/server';
import { db } from '@/db';
import { brands } from '@/db/schema';
import { brandData } from '@/db/brand-data';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // Fetch active brands from database
        let currentBrands = await db.select().from(brands).where(eq(brands.isActive, true));

        // If table is empty, seed it (Initial setup)
        if (currentBrands.length === 0) {
            console.log("Seeding brands table...");
            const brandsToInsert = brandData.map(b => ({
                name: b.name,
                slug: b.slug,
                logo: b.logo,
                isPopular: b.isPopular || false,
                sortOrder: b.sortOrder || 0,
                isActive: true
            }));

            await db.insert(brands).values(brandsToInsert);
            currentBrands = await db.select().from(brands).where(eq(brands.isActive, true));
        }

        // Sort by isPopular (true first) and then by sortOrder
        const sortedBrands = currentBrands.sort((a, b) => {
            if (a.isPopular !== b.isPopular) {
                return a.isPopular ? -1 : 1;
            }
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        return NextResponse.json(sortedBrands);
    } catch (error) {
        console.error("Failed to fetch brands:", error);
        // Fallback to static data if DB fails during initial setup
        return NextResponse.json(brandData, { status: 200 });
    }
}
