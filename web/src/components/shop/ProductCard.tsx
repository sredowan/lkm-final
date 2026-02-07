"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Star } from 'lucide-react';
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




    const comparePrice = Number(price) * 1.2;
    const discount = Math.round(((comparePrice - Number(price)) / comparePrice) * 100);

    return (
        <>
            <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100/50 hover:border-gray-200 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative">

                {/* Image Section */}
                <Link href={`/shop/${slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                    {/* Badges */}




                    {/* Image */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                    )}
                    <img
                        src={displayImage}
                        alt={name}
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Quick Action Overlay (Slide Up) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 bg-gradient-to-t from-white/90 to-transparent pt-12">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-brand-blue text-white h-11 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:bg-blue-700 transition-colors transform active:scale-95"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </button>
                    </div>
                </Link>

                {/* Details Section */}
                <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-brand-yellow transition-colors">
                            {brand || 'LKM'}
                        </span>
                    </div>

                    <Link href={`/shop/${slug}`} className="block mb-2 group-hover:text-brand-blue transition-colors">
                        <h3 className="font-bold text-gray-900 text-[13px] leading-snug" title={name}>
                            {name}
                        </h3>
                    </Link>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">
                                ${comparePrice.toFixed(2)}
                            </span>
                            <span className="text-lg font-black text-brand-blue">
                                ${Number(price).toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleBuyNow}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-brand-yellow hover:text-brand-blue transition-colors"
                            title="Buy Now"
                        >
                            <Zap className="w-4 h-4" />
                        </button>
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
