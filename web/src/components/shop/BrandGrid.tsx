
import Link from "next/link";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

interface BrandGridProps {
    brands: Brand[];
}

export default function BrandGrid({ brands }: BrandGridProps) {
    // Removed internal fetching. Brands are now passed via props.

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter sm:text-4xl">
                        Shop By <span className="text-brand-blue">Brands</span>
                    </h2>
                    <div className="w-20 h-1.5 bg-brand-yellow mx-auto mt-4 rounded-full" />
                    <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                        We stock the most premium mobile brands and accessories in Sydney.
                        Official warranty and 100% genuine products guaranteed.
                    </p>
                </div>

                {/* Grid: 2 columns on mobile, 5 columns on desktop as requested */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/shop?brand=${brand.slug}`}
                            className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center justify-center aspect-[4/3] hover:shadow-2xl hover:border-brand-blue transition-all group hover:-translate-y-1"
                        >
                            <img
                                src={brand.logo || ""}
                                alt={brand.name}
                                className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${brand.name}&background=random`;
                                }}
                            />
                        </Link>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center px-8 py-4 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-yellow hover:text-brand-blue transition-all shadow-xl active:scale-95"
                    >
                        View All Authorized Brands
                    </Link>
                </div>
            </div>
        </section>
    );
}
