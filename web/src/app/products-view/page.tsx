import { Suspense } from 'react';
import ProductsViewClient from "@/components/shop/ProductsViewClient";
import { db } from '@/db';
import { brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { brandData } from '@/db/brand-data';

export const dynamic = 'force-dynamic';

export default async function ProductsViewPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    let initialBrands = [];

    try {
        const dbBrands = await db.select().from(brands).where(eq(brands.isActive, true));
        initialBrands = dbBrands.sort((a, b) => { // @ts-ignore
            if (a.isPopular !== b.isPopular) { // @ts-ignore
                return a.isPopular ? -1 : 1;
            }
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
    } catch (error) {
        console.error("Failed to fetch brands:", error);
        initialBrands = brandData.map((b, index) => ({
            ...b,
            id: index + 1,
            logo: b.logo,
            isPopular: b.isPopular ?? false,
            isActive: true,
            sortOrder: b.sortOrder ?? 0
        }));
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
            <ProductsViewClient initialBrands={initialBrands} searchParams={searchParams} />
        </Suspense>
    );
}
