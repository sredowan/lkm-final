'use client';

import { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { Loader2 } from "lucide-react";

type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    categoryId?: string;
};

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
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
    }, []);

    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50">
            <Header />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop Accessories & Devices</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Browse our curated selection of premium accessories, refurbished phones, and genuine parts.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.imageUrl}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                            <p className="text-xl text-gray-500">No products found. Please check back later!</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
