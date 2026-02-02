import Link from "next/link";

import ProductDetail from "@/components/shop/ProductDetail";

async function getProduct(slug: string) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
        cache: 'no-store'
    });
    if (!res.ok) return undefined;
    return res.json();
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const product = await getProduct(params.id);

    if (!product) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
                    <Link href="/shop" className="text-brand-blue font-bold hover:underline">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <ProductDetail product={product} />
    );
}
