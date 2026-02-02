import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

async function getProduct(id: string) {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/products/${id}`, {
        cache: 'no-store'
    });
    if (!res.ok) return undefined;
    return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);

    if (!product) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                        <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
                        <Link href="/shop" className="text-brand-blue font-bold hover:underline">
                            Back to Shop
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const discount = product.compareAtPrice && product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50">
            <Header />

            <main className="flex-1 py-10">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb / Back */}
                    <div className="mb-8">
                        <Link href="/shop" className="inline-flex items-center text-gray-500 hover:text-brand-blue transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">

                            {/* Image Section */}
                            <div className="bg-gray-50 p-8 flex items-center justify-center min-h-[400px] relative">
                                <div className="relative w-full h-[400px]">
                                    <Image
                                        src={product.imageUrl || "/placeholder.png"}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                {discount > 0 && (
                                    <div className="absolute top-6 left-6 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                                        -{discount}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-3xl font-bold text-brand-blue">
                                        ${Number(product.price).toFixed(2)}
                                    </span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <span className="text-xl text-gray-400 line-through">
                                            ${Number(product.compareAtPrice).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 py-6 mb-6">
                                    <p className="text-gray-600 leading-relaxed">
                                        {product.description || "No description available for this product."}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center text-green-600 font-medium">
                                        <Check className="w-5 h-5 mr-2" /> In Stock & Ready to Ship
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Check className="w-5 h-5 mr-2 text-brand-blue" /> 6 Months Warranty Included
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Check className="w-5 h-5 mr-2 text-brand-blue" /> Free Shipping on orders over $100
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button className="flex-1 bg-brand-yellow text-brand-blue font-bold py-4 px-8 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-100 flex items-center justify-center gap-2 text-lg">
                                        <ShoppingCart className="w-6 h-6" /> Add to Cart
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
