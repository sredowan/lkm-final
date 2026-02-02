"use client";

import { CheckCircle, CreditCard, Settings, Truck, Package, Clock } from "lucide-react";

interface OrderTrackingProgressProps {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    shippingProvider?: string | null;
    trackingNumber?: string | null;
    orderDate: string;
    compact?: boolean;
}

// Calculate estimated delivery (2-3 business days from order date)
function getEstimatedDelivery(orderDate: string): { min: Date; max: Date } {
    const date = new Date(orderDate);
    let businessDaysAdded = 0;
    const minDate = new Date(date);
    const maxDate = new Date(date);

    // Add 2 business days for min
    while (businessDaysAdded < 2) {
        minDate.setDate(minDate.getDate() + 1);
        const day = minDate.getDay();
        if (day !== 0 && day !== 6) businessDaysAdded++;
    }

    // Add 3 business days for max
    businessDaysAdded = 0;
    while (businessDaysAdded < 3) {
        maxDate.setDate(maxDate.getDate() + 1);
        const day = maxDate.getDay();
        if (day !== 0 && day !== 6) businessDaysAdded++;
    }

    return { min: minDate, max: maxDate };
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });
}

const STEPS = [
    { key: 'placed', label: 'Order Placed', icon: CheckCircle },
    { key: 'paid', label: 'Payment Done', icon: CreditCard },
    { key: 'processing', label: 'Processing', icon: Settings },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Package },
];

function getActiveStep(status: string, paymentStatus: string): number {
    if (status === 'cancelled') return -1;
    if (status === 'delivered') return 5;
    if (status === 'shipped') return 4;
    if (status === 'processing') return 3;
    if (paymentStatus === 'paid') return 2;
    return 1; // Order placed
}

export default function OrderTrackingProgress({
    status,
    paymentStatus,
    shippingProvider,
    trackingNumber,
    orderDate,
    compact = false
}: OrderTrackingProgressProps) {
    const activeStep = getActiveStep(status, paymentStatus);
    const estimated = getEstimatedDelivery(orderDate);

    if (status === 'cancelled') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                </div>
                <h3 className="font-bold text-red-800 text-lg">Order Cancelled</h3>
                <p className="text-red-600 mt-2">This order has been cancelled.</p>
            </div>
        );
    }

    return (
        <div className={`${compact ? '' : 'bg-white rounded-2xl shadow-lg p-6 md:p-8'}`}>
            {/* Estimated Delivery */}
            {status !== 'delivered' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Estimated Delivery</p>
                            <p className="font-bold text-gray-900">
                                {formatDate(estimated.min)} - {formatDate(estimated.max)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Delivered Badge */}
            {status === 'delivered' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-green-800">Delivered!</p>
                            <p className="text-sm text-green-600">Your order has been delivered successfully.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Steps - Desktop (Horizontal) */}
            <div className="hidden md:block">
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-brand-blue rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(0, (activeStep - 1) / 4) * 100}%` }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {STEPS.map((step, index) => {
                            const stepNum = index + 1;
                            const isActive = stepNum <= activeStep;
                            const isCurrent = stepNum === activeStep;
                            const Icon = step.icon;

                            return (
                                <div key={step.key} className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive
                                            ? 'bg-brand-blue border-brand-blue text-white'
                                            : 'bg-white border-gray-200 text-gray-400'
                                            } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <p className={`mt-3 text-sm font-medium text-center ${isActive ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                        {step.key === 'shipped' && shippingProvider && isActive && (
                                            <span className="block text-xs text-brand-blue capitalize">
                                                via {shippingProvider.replace('_', ' ')}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Progress Steps - Mobile (Vertical Timeline) */}
            <div className="md:hidden space-y-0">
                {STEPS.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum <= activeStep;
                    const isCurrent = stepNum === activeStep;
                    const isLast = index === STEPS.length - 1;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex">
                            {/* Icon and Line */}
                            <div className="flex flex-col items-center mr-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                                        ? 'bg-brand-blue border-brand-blue text-white'
                                        : 'bg-white border-gray-200 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                {!isLast && (
                                    <div className={`w-0.5 h-12 ${stepNum < activeStep ? 'bg-brand-blue' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                                <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </p>
                                {step.key === 'shipped' && shippingProvider && isActive && (
                                    <p className="text-sm text-brand-blue capitalize">
                                        via {shippingProvider.replace('_', ' ')}
                                    </p>
                                )}
                                {isCurrent && step.key !== 'delivered' && (
                                    <span className="inline-flex items-center gap-1 mt-1 text-xs bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
                                        Current
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tracking Number */}
            {trackingNumber && (status === 'shipped' || status === 'delivered') && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-sm text-gray-600">Tracking Number</p>
                            <p className="font-mono font-bold text-gray-900 text-lg">{trackingNumber}</p>
                        </div>
                        {shippingProvider && (
                            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
                                <Truck className="w-4 h-4" />
                                {shippingProvider === 'aus_post' && 'Australia Post'}
                                {shippingProvider === 'sendle' && 'Sendle'}
                                {shippingProvider === 'startrack' && 'StarTrack'}
                                {shippingProvider === 'dhl' && 'DHL Express'}
                                {shippingProvider === 'other' && 'Other Carrier'}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
