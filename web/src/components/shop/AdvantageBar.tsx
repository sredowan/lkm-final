import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';

export default function AdvantageBar() {
    const advantages = [
        {
            icon: ShieldCheck,
            title: "Official Product",
            description: "100% Genuine Guaranteed"
        },
        {
            icon: Truck,
            title: "Fastest Delivery",
            description: "Same day in Sydney"
        },
        {
            icon: CreditCard,
            title: "Secure Payment",
            description: "SSL Protected Checkout"
        },
        {
            icon: Headphones,
            title: "Expert Support",
            description: "Professional Assistance"
        }
    ];

    return (
        <div className="bg-white border-y border-gray-100 py-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {advantages.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-300">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
