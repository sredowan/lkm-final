"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Zap, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import VariantSelectionModal from './VariantSelectionModal';

interface Variant {
    id: number;
    color?: string;
    storage?: string;
    price?: string | number;
    stock?: number;
}

interface ProductCardProps {
    id: string;
    slug: string;
    name: string;
    price: number;
    image?: string;
    categoryId?: string;
    brand?: string;
    condition?: string;
    variants?: Variant[];
}

export default function ProductCard({
    id,
    slug,
    name,
    price,
    image,
    brand,
    condition,
    variants = []
}: ProductCardProps) {
    const router = useRouter();
    const { addItem } = useCart();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [modalMode, setModalMode] = useState<"cart" | "buy">("cart");
    const [imageLoaded, setImageLoaded] = useState(false);

    // Use a placeholder if no image
    const displayImage = image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop';

    const hasVariants = variants.length > 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasVariants) {
            setModalMode("cart");
            setShowVariantModal(true);
        } else {
            addItem({
                id,
                name,
                price: Number(price),
                image: displayImage
            });
        }
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasVariants) {
            setModalMode("buy");
            setShowVariantModal(true);
        } else {
            addItem({
                id,
                name,
                price: Number(price),
                image: displayImage
            });
            router.push("/checkout");
        }
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    // Get badge info based on condition
    const getBadge = () => {
        if (condition === 'refurbished') return { text: 'Refurbished', color: 'bg-orange-500' };
        if (condition === 'used') return { text: 'Pre-Owned', color: 'bg-purple-500' };
        return { text: 'New', color: 'bg-emerald-500' };
    };

    const badge = getBadge();
    const comparePrice = Number(price) * 1.2;
    const discount = Math.round(((comparePrice - Number(price)) / comparePrice) * 100);

    return (
        <>
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative overflow-hidden">
                {/* Condition Badge */}
                <div className={`absolute top-3 left-3 z-10 ${badge.color} text-white text-[10px] font-bold px-2 py-1 rounded-md`}>
                    {badge.text}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isWishlisted
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-md'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Clickable Image Container */}
                <Link href={`/shop/${slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer">
                        {/* Loading skeleton */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                        )}
                        <img
                            src={displayImage}
                            alt={name}
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </div>
                </Link>

                {/* Content Container */}
                <div className="p-3 flex flex-col flex-grow">
                    {/* Brand */}
                    <span className="text-[10px] text-brand-blue font-semibold uppercase tracking-wider mb-0.5">
                        {brand || 'Premium Device'}
                    </span>

                    {/* Product Name */}
                    <Link href={`/shop/${slug}`} className="block mb-1.5">
                        <h3 className="font-semibold text-gray-900 text-xs group-hover:text-brand-blue transition-colors leading-snug line-clamp-2 min-h-[2rem]">
                            {name}
                        </h3>
                    </Link>



                    {/* Price Section */}
                    <div className="mt-auto">
                        <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="text-lg font-black text-gray-900">
                                ${Number(price).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                                ${comparePrice.toFixed(2)}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1.5">
                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="flex-shrink-0 bg-gray-100 text-gray-700 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all"
                                title="Add to Cart"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>

                            {/* Buy Now Button */}
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-brand-blue text-white h-9 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs hover:bg-blue-700 transition-all"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Variant Selection Modal */}
            <VariantSelectionModal
                isOpen={showVariantModal}
                onClose={() => setShowVariantModal(false)}
                product={{
                    id,
                    name,
                    price: Number(price),
                    image: displayImage
                }}
                variants={variants}
                mode={modalMode}
            />
        </>
    );
}
