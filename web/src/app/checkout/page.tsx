"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShoppingBag,
    User,
    CreditCard,
    Check,
    ChevronRight,
    Minus,
    Plus,
    Trash2,
    Truck,
    Shield,
    Lock,
    Loader2,
    AlertCircle,
    Store,
    MapPin
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface ShippingZone {
    id: number;
    name: string;
    postcodes: string | null;
    flatRate: string | null;
    freeShippingThreshold: string | null;
    weightRate: string | null;
}

interface PaymentMethods {
    stripe: { enabled: boolean; publicKey: string };
    paypal: { enabled: boolean };
    afterpay: { enabled: boolean };
    cashOnDelivery: { enabled: boolean; instructions: string };
    inStorePickup: { enabled: boolean; instructions: string };
}

interface CheckoutSettings {
    paymentMethods: PaymentMethods;
    shippingZones: ShippingZone[];
}

// Stripe Payment Form Component
function StripePaymentForm({ clientSecret, onSuccess, onError, checkoutData }: {
    clientSecret: string;
    onSuccess: (orderNumber: string) => void;
    onError: (message: string) => void;
    checkoutData: any;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success`,
            },
            redirect: "if_required",
        });

        if (error) {
            onError(error.message || "Payment failed");
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Payment succeeded! Create order client-side (fallback for local dev without webhooks)
            try {
                const orderData = {
                    ...checkoutData,
                    paymentStatus: 'paid',
                    stripePaymentIntentId: paymentIntent.id
                };

                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData)
                });

                const data = await res.json();

                if (res.ok && data.orderNumber) {
                    // Update order to paid status
                    await fetch(`/api/orders/${data.orderId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentStatus: 'paid', status: 'processing' })
                    });
                    onSuccess(data.orderNumber);
                } else {
                    // Payment succeeded but order creation failed - still redirect with temp reference
                    onSuccess(checkoutData.tempReference || 'order');
                }
            } catch (err) {
                console.error("Order creation after payment failed:", err);
                onSuccess(checkoutData.tempReference || 'order');
            }
        } else {
            onError("Payment was not completed. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-brand-blue text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        Pay Now
                    </>
                )}
            </button>
        </form>
    );
}


export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, updateQuantity, removeItem, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Checkout settings
    const [settings, setSettings] = useState<CheckoutSettings | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("stripe");
    const [selectedShippingZone, setSelectedShippingZone] = useState<ShippingZone | null>(null);

    // Stripe state
    const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
    const [pendingCheckoutData, setPendingCheckoutData] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postcode: "",
        notes: ""
    });

    useEffect(() => {
        setMounted(true);
        fetchCheckoutSettings();
    }, []);

    const fetchCheckoutSettings = async () => {
        try {
            const res = await fetch("/api/checkout-settings");
            if (res.ok) {
                const data = await res.json();
                setSettings(data);

                // Set default payment method
                if (data.paymentMethods.inStorePickup?.enabled) {
                    setSelectedPaymentMethod("pickup");
                } else if (data.paymentMethods.cashOnDelivery?.enabled) {
                    setSelectedPaymentMethod("cod");
                } else if (data.paymentMethods.stripe?.enabled) {
                    setSelectedPaymentMethod("stripe");
                }

                // Initialize Stripe if enabled
                if (data.paymentMethods.stripe?.enabled && data.paymentMethods.stripe?.publicKey) {
                    setStripePromise(loadStripe(data.paymentMethods.stripe.publicKey));
                }

                // Set default shipping zone if only one
                if (data.shippingZones.length === 1) {
                    setSelectedShippingZone(data.shippingZones[0]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch checkout settings:", err);
        } finally {
            setSettingsLoading(false);
        }
    };

    // Redirect if cart is empty (after mount to avoid hydration issues)
    useEffect(() => {
        if (mounted && items.length === 0 && !orderPlaced) {
            router.push("/shop");
        }
    }, [mounted, items.length, router, orderPlaced]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    // Calculate shipping based on selected zone
    const calculateShipping = (): number => {
        if (selectedPaymentMethod === "pickup") return 0;
        if (!selectedShippingZone) return 9.95; // Default shipping

        const flatRate = parseFloat(selectedShippingZone.flatRate || "0");
        const freeThreshold = parseFloat(selectedShippingZone.freeShippingThreshold || "0");

        if (freeThreshold > 0 && total >= freeThreshold) {
            return 0;
        }

        return flatRate || 9.95;
    };

    const subtotal = total;
    const shipping = calculateShipping();
    const grandTotal = subtotal + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic validation
        if (!formData.name || !formData.email || !formData.phone) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
        }

        if (selectedPaymentMethod !== "pickup" && !formData.address) {
            setError("Please enter your shipping address");
            setLoading(false);
            return;
        }

        const fullAddress = selectedPaymentMethod === "pickup"
            ? "In-Store Pickup"
            : formData.city
                ? `${formData.address}, ${formData.city} ${formData.postcode}`.trim()
                : formData.address;

        const checkoutData = {
            customer: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: fullAddress
            },
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: subtotal,
            shipping: shipping,
            total: grandTotal,
            paymentMethod: selectedPaymentMethod,
            notes: formData.notes,
            shippingZoneId: selectedShippingZone?.id
        };

        try {
            // For Stripe: Get payment intent first (order will be created after successful payment)
            if (selectedPaymentMethod === "stripe") {
                const intentRes = await fetch("/api/create-payment-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(checkoutData)
                });

                const intentData = await intentRes.json();

                if (!intentRes.ok || !intentData.clientSecret) {
                    setError(intentData.error || "Failed to initialize payment");
                    setLoading(false);
                    return;
                }

                setPendingOrderNumber(intentData.tempReference);
                setClientSecret(intentData.clientSecret);
                setPendingCheckoutData(checkoutData);
                setShowStripeForm(true);
                setLoading(false);
            } else {
                // For COD or Pickup: Create order directly
                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(checkoutData)
                });

                const data = await res.json();

                if (!res.ok || !data.orderNumber) {
                    setError(data.error || "Failed to place order. Please try again.");
                    setLoading(false);
                    return;
                }

                setOrderPlaced(true);
                clearCart();
                router.push(`/order-success/${data.orderNumber}`);
            }
        } catch (err) {
            console.error("Checkout error:", err);
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const handleStripeSuccess = (orderNumber: string) => {
        setOrderPlaced(true);
        clearCart();
        router.push(`/order-success/${orderNumber}`);
    };

    const handleStripeError = (message: string) => {
        setError(message);
        setShowStripeForm(false);
        setClientSecret(null);
    };


    // Show loading state during hydration
    if (!mounted || settingsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-brand-blue">
                            LAKEMBA<span className="text-brand-yellow">MOBILE KING</span>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Lock className="w-4 h-4" />
                            Secure Checkout
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">
                                <Check className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Cart</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <div className="flex items-center gap-2 text-brand-blue">
                            <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">
                                2
                            </div>
                            <span className="font-medium">Checkout</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                                3
                            </div>
                            <span>Confirmation</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-brand-blue" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                            </div>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Smith"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="0412 345 678"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Shipping Method */}
                        {selectedPaymentMethod !== "pickup" && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Shipping</h2>
                                </div>

                                {/* Shipping Zones */}
                                {settings?.shippingZones && settings.shippingZones.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Delivery Zone
                                        </label>
                                        <div className="space-y-2">
                                            {settings.shippingZones.map(zone => {
                                                const flatRate = parseFloat(zone.flatRate || "0");
                                                const freeThreshold = parseFloat(zone.freeShippingThreshold || "0");
                                                const isFree = freeThreshold > 0 && total >= freeThreshold;

                                                return (
                                                    <label
                                                        key={zone.id}
                                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedShippingZone?.id === zone.id
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="shippingZone"
                                                            checked={selectedShippingZone?.id === zone.id}
                                                            onChange={() => setSelectedShippingZone(zone)}
                                                            className="w-5 h-5 text-green-600"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium text-gray-900">{zone.name}</span>
                                                            </div>
                                                            {zone.postcodes && (
                                                                <p className="text-xs text-gray-500 mt-1">Postcodes: {zone.postcodes}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            {isFree ? (
                                                                <span className="text-green-600 font-bold">FREE</span>
                                                            ) : (
                                                                <span className="font-bold">${flatRate.toFixed(2)}</span>
                                                            )}
                                                            {freeThreshold > 0 && !isFree && (
                                                                <p className="text-xs text-gray-500">Free over ${freeThreshold}</p>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Address Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Street Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            form="checkout-form"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            placeholder="123 Main Street"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                City/Suburb
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                form="checkout-form"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Sydney"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Postcode
                                            </label>
                                            <input
                                                type="text"
                                                name="postcode"
                                                form="checkout-form"
                                                value={formData.postcode}
                                                onChange={handleChange}
                                                placeholder="2000"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                {/* Stripe */}
                                {settings?.paymentMethods.stripe?.enabled && (
                                    <label
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "stripe"
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={selectedPaymentMethod === "stripe"}
                                            onChange={() => setSelectedPaymentMethod("stripe")}
                                            className="w-5 h-5 text-purple-600"
                                        />
                                        <CreditCard className="w-5 h-5 text-purple-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Credit / Debit Card</p>
                                            <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <img src="https://cdn.simpleicons.org/visa/default" alt="Visa" className="h-4 w-auto grayscale group-hover:grayscale-0 transition-all" />
                                            <img src="https://cdn.simpleicons.org/mastercard/default" alt="Mastercard" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" />
                                            <img src="https://cdn.simpleicons.org/americanexpress/default" alt="Amex" className="h-5 w-auto grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                    </label>
                                )}

                                {/* In-Store Pickup */}
                                {settings?.paymentMethods.inStorePickup?.enabled && (
                                    <label
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "pickup"
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={selectedPaymentMethod === "pickup"}
                                            onChange={() => setSelectedPaymentMethod("pickup")}
                                            className="w-5 h-5 text-green-600"
                                        />
                                        <Store className="w-5 h-5 text-green-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">In-Store Pickup</p>
                                            <p className="text-sm text-gray-500">Pick up and pay at our store</p>
                                        </div>
                                        <span className="text-green-600 font-bold text-sm">FREE</span>
                                    </label>
                                )}
                            </div>

                            {/* Stripe Payment Form */}
                            {showStripeForm && clientSecret && stripePromise && pendingCheckoutData && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <StripePaymentForm
                                            clientSecret={clientSecret}
                                            onSuccess={handleStripeSuccess}
                                            onError={handleStripeError}
                                            checkoutData={pendingCheckoutData}
                                        />
                                    </Elements>
                                </div>
                            )}
                        </div>

                        {/* Order Notes */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Order Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                form="checkout-form"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Any special instructions..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-32">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                                <span className="ml-auto text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ShoppingBag className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                                            <p className="text-brand-blue font-bold">${item.price.toFixed(2)}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-auto text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                                        {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                                    <span>Total</span>
                                    <span className="text-brand-blue">${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            {!showStripeForm && (
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={loading}
                                    className="w-full mt-6 bg-brand-blue text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : selectedPaymentMethod === "stripe" ? (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Continue to Payment
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Place Order
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-4 h-4" />
                                        <span>Secure</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Truck className="w-4 h-4" />
                                        <span>Fast Delivery</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Check className="w-4 h-4" />
                                        <span>Warranty</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
