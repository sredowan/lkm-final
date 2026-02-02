'use client';

import { Star, User } from 'lucide-react';
import reviewsData from '@/data/reviews.json';
import { useMemo } from 'react';
import Image from 'next/image';

export default function ReviewsCarousel() {
    // Logic: Fetch 5 star reviews, sort by length (longest first)
    const reviews = useMemo(() => {
        return reviewsData
            .filter(r => r.rating === 5)
            .sort((a, b) => b.text.length - a.text.length);
    }, []);

    return (
        <section className="py-16 bg-gray-50 border-t border-gray-100 overflow-hidden">
            <div className="container mx-auto px-4 mb-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    {/* Google G Logo SVG */}
                    <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center p-1.5">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-700">Google Reviews</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our Customers Love Us</h2>
                <div className="flex items-center justify-center gap-1 text-yellow-400">
                    <span className="font-bold text-gray-900 mr-2 text-xl">5.0</span>
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                    ))}

                </div>
            </div>

            {/* Scrollable Carousel */}
            {/* Mobile: 1.5 columns -> ~66% width. Desktop: 4.5 columns -> ~22% width */}
            <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory px-4 md:px-0 no-scrollbar">
                <div className="flex gap-4 md:gap-6 w-max mx-auto px-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="snap-center shrink-0 w-[70vw] md:w-[280px] lg:w-[350px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow relative"
                        >
                            {/* Google Logo Watermark */}
                            <div className="absolute top-6 right-6 opacity-10 grayscale">
                                <svg viewBox="0 0 24 24" className="w-6 h-6">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>

                            <div className="flex items-center gap-1 mb-3 text-yellow-400">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
                                "{review.text.length > 150 ? review.text.substring(0, 150) + "..." : review.text}"
                            </p>

                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                                    {review.profile_photo_url ? (
                                        <img src={review.profile_photo_url} alt={review.author_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-900">{review.author_name}</span>
                                    <span className="text-[10px] text-gray-400">{review.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Spacer for right padding in scrolling */}
                    <div className="w-4 shrink-0 md:hidden"></div>
                </div>
            </div>
        </section>
    );
}
