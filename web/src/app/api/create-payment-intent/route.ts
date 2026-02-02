import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, customer, total, shipping, paymentMethod, shippingZoneId, notes } = body;

        // Validate required fields
        if (!items || !items.length || !customer || !total) {
            return NextResponse.json({ error: 'Missing required checkout data' }, { status: 400 });
        }

        // Fetch Stripe credentials from settings
        const [paymentSettings] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, 'payment_settings'))
            .limit(1);

        if (!paymentSettings?.value) {
            return NextResponse.json({ error: 'Payment settings not configured' }, { status: 500 });
        }

        const parsedSettings = JSON.parse(paymentSettings.value);
        const stripeSecretKey = parsedSettings.stripe?.secretKey;

        if (!stripeSecretKey) {
            return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-12-15.clover',
        });

        // Convert total to cents (Stripe expects amount in smallest currency unit)
        const amountInCents = Math.round(parseFloat(total) * 100);

        // Generate a temporary reference for tracking
        const tempReference = `LKM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Store order data in metadata (Stripe metadata values must be strings, max 500 chars each)
        // For items, we'll store a simplified version
        const itemsSummary = items.map((item: CartItem) => ({
            id: item.id,
            name: item.name.substring(0, 50), // Truncate long names
            price: item.price,
            qty: item.quantity
        }));

        // Create PaymentIntent with order data in metadata
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'aud',
            metadata: {
                tempReference,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                items: JSON.stringify(itemsSummary),
                subtotal: (total - (shipping || 0)).toString(),
                shipping: (shipping || 0).toString(),
                total: total.toString(),
                paymentMethod: paymentMethod || 'stripe',
                shippingZoneId: shippingZoneId?.toString() || '',
                notes: notes || '',
            },
            automatic_payment_methods: {
                enabled: true,
            },
            receipt_email: customer.email,
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            tempReference,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}
