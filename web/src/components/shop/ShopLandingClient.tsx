"use client";

import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import StoreHero from "@/components/shop/StoreHero";
import FeaturedBrands from "@/components/shop/FeaturedBrands";
import FeaturedCategories from "@/components/shop/FeaturedCategories";

type Category = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    children?: Category[];
};

type Product = {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    image?: string;
    imageUrl?: string;
    primaryImage?: string;
    brand?: string;
    slug: string;
    condition?: string;
    variants?: any[];
};

type Brand = { id: number; name: string; slug: string; logo: string | null; isPopular: boolean | null; };

interface ShopClientProps {
    initialBrands: Brand[];
    initialCategories: Category[];
}

const PRODUCTS_PER_PAGE = 20;

// Smart pagination helper — shows max 7 items with ellipsis
function getPaginationItems(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const items: (number | '...')[] = [];
    if (current <= 4) {
        items.push(1, 2, 3, 4, 5, '...', total);
    } else if (current >= total - 3) {
        items.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
        items.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return items;
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-50" />
            <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-3/5" />
                <div className="h-6 bg-gray-100 rounded w-2/5 mt-2" />
            </div>
        </div>
    );
}

export default function ShopLandingClient({ initialBrands }: { initialBrands: Brand[] }) {
    const router = useRouter();

    const handleBrandChange = (slug: string) => {
        if (!slug) {
            router.push('/products');
        } else {
            router.push(`/products?brand=${slug}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 pt-[104px] w-full">
                <div className="mb-12">
                    {/* 1. Main Hero Slider */}
                    <StoreHero />

                    {/* 2. Featured Categories */}
                    <FeaturedCategories />

                    {/* 3. Shop by Brands (Interactive Tabs) */}
                    <FeaturedBrands
                        brands={initialBrands}
                        activeBrandSlug=""
                        onBrandChange={handleBrandChange}
                    />
                </div>
            </main>

        </div>
    );
}
