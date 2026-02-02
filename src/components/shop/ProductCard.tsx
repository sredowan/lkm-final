import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image?: string;
    categoryId?: string;
}

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
    // Use a placeholder if no image
    const displayImage = image || 'https://placehold.co/300x300/e2e8f0/1e293b?text=LKM+Product';

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Image
                    src={displayImage}
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="bg-white text-gray-900 p-2 rounded-full hover:bg-brand-yellow hover:text-brand-blue transition-colors" title="Add to Cart">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <Link href={`/shop/${id}`} className="block">
                    <h3 className="font-bold text-gray-800 mb-1 group-hover:text-brand-blue line-clamp-2 min-h-[3rem]">
                        {name}
                    </h3>
                </Link>
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-brand-blue">${price.toFixed(2)}</span>
                    {/* Optional: Add "Buy" button here directly */}
                </div>
            </div>
        </div>
    );
}
