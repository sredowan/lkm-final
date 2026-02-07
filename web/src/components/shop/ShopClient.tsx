"use client";

import { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import StoreHero from "@/components/shop/StoreHero";
import FeaturedBrands from "@/components/shop/FeaturedBrands";
import FeaturedCategories from "@/components/shop/FeaturedCategories";
import ProductScroller from "@/components/shop/ProductScroller";
import SEOContent from "@/components/shop/SEOContent";

type Variant = {
    id: number;
    color?: string;
    storage?: string;
    price?: string | number;
    stock?: number;
};

type Product = {
    id: string;
    name: string;
    price: number;
    image?: string;
    imageUrl?: string;
    primaryImage?: string;
    brand?: string;
    slug: string;
    condition?: string;
    isFeatured?: boolean;
    isTopSelling?: boolean;
    variants?: Variant[];
};

type Brand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    isPopular: boolean | null;
    isActive?: boolean | null;
    sortOrder?: number | null;
};

interface ShopClientProps {
    initialBrands: Brand[];
}

export default function ShopClient({ initialBrands }: ShopClientProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBrandSlug, setActiveBrandSlug] = useState<string>("");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const url = activeBrandSlug
                    ? `/api/products?brand=${activeBrandSlug}`
                    : '/api/products';

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [activeBrandSlug]);

    const featuredProducts = products.filter(p => p.isFeatured).length > 0
        ? products.filter(p => p.isFeatured)
        : products.slice(0, 8);

    const topSellingProducts = products.filter(p => p.isTopSelling).length > 0
        ? products.filter(p => p.isTopSelling)
        : products.slice(4, 12);

    const brandName = activeBrandSlug
        ? activeBrandSlug.charAt(0).toUpperCase() + activeBrandSlug.slice(1).replace('-', ' ')
        : "";

    return (
        <div className="flex min-h-screen flex-col font-sans bg-white">
            <Header />

            <main className="flex-1 pt-[104px]">
                {/* 1. Main Hero Slider */}
                <StoreHero />

                {/* 2. Featured Categories */}
                <FeaturedCategories />

                {/* 3. Shop by Brands (Interactive Tabs) */}
                <FeaturedBrands
                    brands={initialBrands}
                    activeBrandSlug={activeBrandSlug}
                    onBrandChange={setActiveBrandSlug}
                />

                {/* 4. Products Section (related to brand filtering above) */}
                <ProductScroller
                    title={brandName ? `${brandName} Products` : "Featured Products"}
                    products={featuredProducts}
                    viewAllLink={activeBrandSlug ? `/products-view?brand=${activeBrandSlug}` : "/products-view"}
                    hideArrows={true}
                />


                {/* 5. Top Selling Items Section */}
                <ProductScroller
                    title="Top Selling Items"
                    products={topSellingProducts}
                />

                {/* 6. SEO Content Section */}
                <SEOContent />
            </main>
        </div>
    );
}
