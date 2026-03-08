import { Suspense } from 'react';
import Header from "@/components/layout/Header";
import SearchResults from "@/components/shop/SearchResults";
import Footer from "@/components/layout/Footer";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans bg-white">
            <Header />

            <main className="flex-1 pt-[104px]">
                <Suspense fallback={
                    <div className="container mx-auto px-4 py-8 animate-pulse text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-300">Loading search results...</h2>
                    </div>
                }>
                    <SearchResults />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
