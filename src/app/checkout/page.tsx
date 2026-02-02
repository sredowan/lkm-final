"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/cart-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        shippingAddress: "",
        notes: ""
    });

    if (items.length === 0) {
        if (typeof window !== "undefined") router.push("/shop");
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const orderData = {
            orderNumber: `ORD-${Date.now()}`,
            ...formData,
            subtotal: total.toFixed(2),
            total: total.toFixed(2), // Skipping tax/shipping calculation for MVP
            paymentMethod: "cod", // Hardcoded for MVP
            items: items.map(item => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price.toFixed(2),
                total: (item.price * item.quantity).toFixed(2)
            }))
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                clearCart();
                alert("Order placed successfully!");
                router.push("/");
            } else {
                alert("Failed to place order");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Form */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input name="customerName" required className="mt-1 block w-full rounded border border-gray-300 p-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input name="customerEmail" type="email" required className="mt-1 block w-full rounded border border-gray-300 p-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input name="customerPhone" required className="mt-1 block w-full rounded border border-gray-300 p-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                                    <textarea name="shippingAddress" required className="mt-1 block w-full rounded border border-gray-300 p-2" rows={3} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                    <textarea name="notes" className="mt-1 block w-full rounded border border-gray-300 p-2" rows={2} onChange={handleChange} />
                                </div>
                            </form>
                        </div>

                        {/* Summary */}
                        <div className="rounded-lg bg-white p-6 shadow-sm h-fit">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <ul className="divide-y divide-gray-200 mb-4">
                                {items.map(item => (
                                    <li key={item.id} className="py-2 flex justify-between">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="mt-6 w-full rounded bg-brand-yellow py-3 font-bold text-gray-900 hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Place Order"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
