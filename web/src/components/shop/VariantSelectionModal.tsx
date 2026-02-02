"use client";

import { useState, useEffect } from "react";
import { X, ShoppingCart, Zap, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface Variant {
    id: number;
    color?: string;
    storage?: string;
    price?: string | number;
    stock?: number;
}

interface VariantSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
    };
    variants: Variant[];
    mode: "cart" | "buy";
}

export default function VariantSelectionModal({
    isOpen,
    onClose,
    product,
    variants,
    mode
}: VariantSelectionModalProps) {
    const router = useRouter();
    const { addItem, clearCart } = useCart();

    // Get unique colors and storage options
    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const storages = [...new Set(variants.map(v => v.storage).filter(Boolean))];

    const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]);
    const [selectedStorage, setSelectedStorage] = useState<string | undefined>(storages[0]);

    // Find the selected variant
    const selectedVariant = variants.find(
        v => v.color === selectedColor && v.storage === selectedStorage
    ) || variants.find(v => v.color === selectedColor) || variants.find(v => v.storage === selectedStorage) || variants[0];

    const displayPrice = selectedVariant?.price
        ? Number(selectedVariant.price)
        : product.price;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const variantName = [
            product.name,
            selectedColor,
            selectedStorage
        ].filter(Boolean).join(' - ');

        addItem({
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            name: variantName,
            price: displayPrice,
            image: product.image
        });

        onClose();

        if (mode === "buy") {
            router.push("/checkout");
        }
    };

    // Color name to CSS color mapping
    const colorMap: Record<string, string> = {
        'black': '#000000',
        'white': '#FFFFFF',
        'silver': '#C0C0C0',
        'gold': '#FFD700',
        'rose gold': '#B76E79',
        'blue': '#007AFF',
        'red': '#FF3B30',
        'green': '#34C759',
        'purple': '#AF52DE',
        'pink': '#FF2D55',
        'gray': '#8E8E93',
        'space gray': '#535150',
        'midnight': '#1C1C1E',
        'starlight': '#F0E4D3',
        'pacific blue': '#004D6D',
        'sierra blue': '#A2BAC5',
        'alpine green': '#394C38',
        'deep purple': '#635E7F',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Select Options</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex items-center gap-4 bg-gray-50">
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-1"
                            />
                        ) : (
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                        <p className="text-xl font-black text-brand-blue">${displayPrice.toFixed(2)}</p>
                    </div>
                </div>

                {/* Options */}
                <div className="p-4 space-y-6">
                    {/* Color Selection */}
                    {colors.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Color: <span className="text-brand-blue">{selectedColor}</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color
                                                ? 'border-brand-blue scale-110 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        style={{
                                            backgroundColor: colorMap[color?.toLowerCase() || ''] || '#888'
                                        }}
                                        title={color}
                                    >
                                        {selectedColor === color && (
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <Check className={`w-5 h-5 ${['white', 'silver', 'gold', 'starlight'].includes(color?.toLowerCase() || '')
                                                        ? 'text-gray-800'
                                                        : 'text-white'
                                                    }`} />
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Storage Selection */}
                    {storages.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Storage
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {storages.map(storage => (
                                    <button
                                        key={storage}
                                        onClick={() => setSelectedStorage(storage)}
                                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${selectedStorage === storage
                                                ? 'bg-brand-blue text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {storage}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleConfirm}
                        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${mode === "buy"
                                ? 'bg-brand-yellow text-brand-blue hover:bg-yellow-400 shadow-lg'
                                : 'bg-brand-blue text-white hover:bg-blue-700'
                            }`}
                    >
                        {mode === "buy" ? (
                            <>
                                <Zap className="w-5 h-5" />
                                Buy Now - ${displayPrice.toFixed(2)}
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
