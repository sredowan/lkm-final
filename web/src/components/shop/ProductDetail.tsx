"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShoppingCart,
    Check,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Zap,
    Shield,
    Truck,
    RotateCcw,
    Star,
    Share2,
    Heart
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductImage {
    id: number;
    imageUrl: string;
    altText?: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    comparePrice?: number;
    description?: string;
    shortDescription?: string;
    images?: ProductImage[];
    imageUrl?: string;
    brand?: string;
    condition?: string;
    stock?: number;
    specs?: { specName: string; specValue: string }[];
}

export default function ProductDetail({ product }: { product: Product }) {
    const router = useRouter();
    const { addItem, items } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Get all images (primary + gallery)
    const allImages = product.images && product.images.length > 0
        ? product.images.map(img => img.imageUrl)
        : [product.imageUrl || "/placeholder.png"];

    // Calculate discount
    const discount = product.comparePrice && product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    // Afterpay calculation (4 payments)
    const afterpayAmount = (product.price / 4).toFixed(2);

    // Handle scroll for sticky bar
    useEffect(() => {
        const handleScroll = () => {
            if (ctaRef.current) {
                const rect = ctaRef.current.getBoundingClientRect();
                setShowStickyBar(rect.bottom < 0);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAddToCart = () => {
        addItem({
            id: String(product.id),
            name: product.name,
            price: product.price,
            image: allImages[0]
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        addItem({
            id: String(product.id),
            name: product.name,
            price: product.price,
            image: allImages[0]
        });
        router.push("/checkout");
    };

    const nextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <>
            <div className="container mx-auto px-4 pt-32 pb-6 md:pt-48 md:pb-10">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center gap-2 text-gray-500">
                        <li><Link href="/" className="hover:text-brand-blue">Home</Link></li>
                        <li>/</li>
                        <li><Link href="/shop" className="hover:text-brand-blue">Shop</Link></li>
                        <li>/</li>
                        <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square max-w-[500px] mx-auto bg-white rounded-2xl overflow-hidden group border border-gray-100">
                            <Image
                                src={allImages[selectedImageIndex]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
                                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                priority
                                quality={90}
                            />

                            {/* Discount Badge */}
                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">
                                    -{discount}% OFF
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all">
                                    <Heart className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnail Strip */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                                            ? "border-brand-blue shadow-lg"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <Image src={img} alt="" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                        {/* Brand & Condition */}
                        <div className="flex items-center gap-3">
                            {product.brand && (
                                <span className="text-sm font-medium text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
                                    {product.brand}
                                </span>
                            )}
                            {product.condition && (
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.condition === 'new'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>



                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                                    ${Number(product.price).toFixed(2)}
                                </span>
                                {product.comparePrice && product.comparePrice > product.price && (
                                    <span className="text-xl text-gray-400 line-through">
                                        ${Number(product.comparePrice).toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Afterpay Badge - Inline */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 w-fit">
                                <span className="font-bold border border-black px-1 rounded bg-white text-black text-[10px]">A</span>
                                <span>or 4 of <strong>${afterpayAmount}</strong> with <strong>Afterpay</strong></span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.shortDescription && (
                            <p className="text-gray-600 leading-relaxed">
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Quantity</label>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                {product.stock !== undefined && (
                                    <span className="text-sm text-gray-500">
                                        {product.stock} available
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div ref={ctaRef} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-lg transition-all ${addedToCart
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                        }`}
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check className="w-5 h-5" /> Added!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" /> Add to Cart
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-lg bg-brand-blue text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                >
                                    <Zap className="w-5 h-5" /> Buy Now
                                </button>
                            </div>

                            {/* Express Checkout */}

                        </div>

                        {/* Trust Badges - Compact Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-xs font-bold text-gray-900">Free Shipping</p>
                                    <p className="text-[10px] text-gray-500">Orders over $100</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Shield className="w-4 h-4 text-brand-blue flex-shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-xs font-bold text-gray-900">6 Month Warranty</p>
                                    <p className="text-[10px] text-gray-500">Included</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-xs font-bold text-gray-900">Easy Returns</p>
                                    <p className="text-[10px] text-gray-500">30 day policy</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-xs font-bold text-gray-900">In Stock</p>
                                    <p className="text-[10px] text-gray-500">Ready to ship</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {product.description && (
                    <div className="mt-12 p-6 lg:p-8 bg-white rounded-2xl border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                        <div
                            className="prose prose-gray max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:mb-4 prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 prose-a:text-blue-600 prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                )}

                {/* Specifications */}
                {product.specs && product.specs.length > 0 && (
                    <div className="mt-6 p-6 lg:p-8 bg-white rounded-2xl border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.specs.map((spec, idx) => (
                                <div key={idx} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-500">{spec.specName}</span>
                                    <span className="font-medium text-gray-900">{spec.specValue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Bottom Bar */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className="container mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={allImages[0]} alt="" fill className="object-contain" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-lg font-bold text-brand-blue">${Number(product.price).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddToCart}
                            className="px-4 py-3 rounded-xl font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="hidden sm:inline">Add</span>
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="px-6 py-3 rounded-xl font-semibold bg-brand-blue text-white hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
