'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isCheckoutRoute = pathname?.startsWith('/checkout');

    // Product detail route should have a white background regardless of system dark mode
    // Match routes like /shop/123 or /shop/slug and allow optional trailing slash
    const isProductRoute = Boolean(pathname && /^\/shop\/[^\/]+\/?$/.test(pathname));

    // Admin and Checkout routes have their own layout, don't show global header/footer
    if (isAdminRoute || isCheckoutRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className={`min-h-screen ${isProductRoute ? 'bg-white' : ''}`}>
                {children}
            </main>
            <Footer />
        </>
    );
}
