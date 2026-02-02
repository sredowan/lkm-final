"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Headphones, Speaker, Watch,
    Pen, Plug, Cable, BatteryCharging, Usb, Wifi
} from 'lucide-react';

// Category data with icons or images
const categories = [
    { name: 'Mobile Phone', slug: 'mobile-phone', image: '/categories/mobile-phone.jpg' },
    { name: 'Tablet', slug: 'tablet', image: '/categories/tablet.jpg' },
    { name: 'Laptop', slug: 'laptop', image: '/categories/laptop.jpg' },
    { name: 'AirPods', slug: 'airpods', image: '/categories/airpods.jpg' },
    { name: 'Wireless Headphone', slug: 'wireless-headphone', image: '/categories/wireless-headphone.jpg' },
    { name: 'Wired Headphone', slug: 'wired-headphone', image: '/categories/wired-headphone.jpg' },
    { name: 'Headphone', slug: 'headphone', image: '/categories/headphone.jpg' },
    { name: 'Speakers', slug: 'speakers', image: '/categories/speakers.jpg' },
    { name: 'Starlink', slug: 'starlink', image: '/categories/starlink.png' },
    { name: 'Smart Watch', slug: 'smart-watch', image: '/categories/smart-watch.jpg' },
    { name: 'Smart Pen', slug: 'smart-pen', image: '/categories/smart-pen.jpg' },
    { name: 'Power Adapter', slug: 'power-adapter', image: '/categories/power-adapter.jpg' },
    { name: 'Cables', slug: 'cables', image: '/categories/cables.jpg' },
    { name: 'Power Bank', slug: 'power-bank', image: '/categories/power-bank.jpg' },
    { name: 'Hubs & Docks', slug: 'hubs-docks', image: '/categories/hubs-docks.jpg' },
    { name: 'Wireless Charger', slug: 'wireless-charger', icon: BatteryCharging },
];

// Type for category
type Category = {
    name: string;
    slug: string;
    image?: string;
    icon?: React.ComponentType<{ className?: string }>;
};

// Category Item Component
function CategoryItem({ category, size = 'desktop' }: { category: Category; size?: 'desktop' | 'mobile' }) {
    const iconSize = size === 'desktop' ? 'w-12 h-12 md:w-14 md:h-14' : 'w-10 h-10';
    const containerSize = size === 'desktop' ? 'w-16 h-16 md:w-[72px] md:h-[72px]' : 'w-14 h-14';
    const textSize = size === 'desktop' ? 'text-sm' : 'text-xs';
    const padding = size === 'desktop' ? 'p-4' : 'p-3';
    const marginBottom = size === 'desktop' ? 'mb-3' : 'mb-2';

    return (
        <Link
            href={`/products-view?category=${category.slug}`}
            className={`group flex flex-col items-center justify-center ${padding} rounded-xl transition-all duration-300 cursor-pointer`}
            aria-label={`Browse ${category.name}`}
        >
            <div className={`${containerSize} flex items-center justify-center ${marginBottom}`}>
                {category.image ? (
                    <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-contain"
                    />
                ) : category.icon ? (
                    <category.icon className={`${iconSize} stroke-[1.5] text-[#1B1949] transition-colors`} />
                ) : null}
            </div>
            <span className={`${textSize} font-medium text-black text-center leading-tight`}>
                {category.name}
            </span>
        </Link>
    );
}

export default function FeaturedCategories() {
    const [showAll, setShowAll] = useState(false);

    // Show 6 on mobile initially, all on desktop
    const mobileCategories = showAll ? categories : categories.slice(0, 6);

    return (
        <section className="py-10 bg-white" aria-label="Featured Categories">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-center">
                    <span className="text-[#1B1949]">Featured </span>
                    <span className="text-brand-blue">
                        Categories
                    </span>
                </h2>

                {/* Desktop Grid - 8 columns */}
                <ul className="hidden md:grid grid-cols-8 gap-6">
                    {categories.map((category) => (
                        <li key={category.slug}>
                            <CategoryItem category={category} size="desktop" />
                        </li>
                    ))}
                </ul>

                {/* Mobile Grid - 3 columns */}
                <ul className="grid grid-cols-3 gap-4 md:hidden">
                    {mobileCategories.map((category) => (
                        <li key={category.slug}>
                            <CategoryItem category={category} size="mobile" />
                        </li>
                    ))}
                </ul>

                {/* Mobile "See All Categories" Button */}
                {!showAll && (
                    <div className="mt-6 text-center md:hidden">
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-[#1B1949] font-medium underline underline-offset-4 hover:text-orange-500 transition-colors"
                            aria-label="See all categories"
                        >
                            See All Categories
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
