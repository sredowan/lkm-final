'use client';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";


export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCheckout = async () => {
        if (!customer.name || !customer.email || !customer.phone || !customer.address) {
            alert("Please fill in all customer details.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    items,
                    total
                })
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                alert(`Order Placed Successfully! Order #${data.orderNumber}`);
                // In a real app, redirect to success page
                window.location.href = "/";
            } else {
                alert("Failed to place order: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col font-sans bg-gray-50">
            <Header />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

                    {items.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
                            <Link href="/shop" className="bg-brand-blue text-white px-8 py-3 rounded-full hover:bg-blue-800 transition">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items */}
                            <div className="lg:w-2/3">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-6 space-y-6">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                                                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                                                    <Image
                                                        src={item.image || "/placeholder.png"}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                    <p className="text-brand-blue font-bold">${Number(item.price).toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 rounded-full hover:bg-gray-100 border"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 rounded-full hover:bg-gray-100 border"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="lg:w-1/3">
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                    <h2 className="text-xl font-bold mb-6">Customer Details</h2>
                                    <div className="space-y-4 mb-6">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full px-4 py-2 border rounded-md"
                                            value={customer.name}
                                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full px-4 py-2 border rounded-md"
                                            value={customer.email}
                                            onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            className="w-full px-4 py-2 border rounded-md"
                                            value={customer.phone}
                                            onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                                        />
                                        <textarea
                                            placeholder="Shipping Address"
                                            className="w-full px-4 py-2 border rounded-md h-24"
                                            value={customer.address}
                                            onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <h2 className="text-xl font-bold mb-6 border-t pt-6">Order Summary</h2>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-bold">${total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="text-green-600 font-medium">Free</span>
                                        </div>
                                        <div className="border-t pt-4 flex justify-between">
                                            <span className="font-bold text-lg">Total</span>
                                            <span className="font-bold text-2xl text-brand-blue">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isSubmitting}
                                        className={`w-full bg-brand-yellow text-brand-blue font-bold py-4 rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-yellow-100 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Place Order'} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
