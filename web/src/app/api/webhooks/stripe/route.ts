import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { settings, orders, orderItems, products, customers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '@/lib/order-email';

// Disable body parsing, we need raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
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
        const webhookSecret = parsedSettings.stripe?.webhookSecret;

        if (!stripeSecretKey || !webhookSecret) {
            return NextResponse.json({ error: 'Stripe credentials not configured' }, { status: 500 });
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-12-15.clover',
        });

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle payment_intent.succeeded event
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const metadata = paymentIntent.metadata;

            // Check if this is a new payment-first flow (has tempReference but no orderId)
            if (metadata.tempReference && !metadata.orderId) {
                // Create the order now that payment is successful
                const orderNumber = metadata.tempReference;
                const customerName = metadata.customerName || 'Customer';
                const customerEmail = metadata.customerEmail || '';
                const customerPhone = metadata.customerPhone || '';
                const customerAddress = metadata.customerAddress || '';
                const total = parseFloat(metadata.total || '0');
                const subtotal = parseFloat(metadata.subtotal || '0');
                const shipping = parseFloat(metadata.shipping || '0');
                const notes = metadata.notes || '';

                // Parse items from metadata
                let items: Array<{ id: string; name: string; price: number; qty: number }> = [];
                try {
                    items = JSON.parse(metadata.items || '[]');
                } catch (e) {
                    console.error('Failed to parse items from metadata:', e);
                }

                // Insert Order
                const orderResult = await db.insert(orders).values({
                    orderNumber,
                    customerName,
                    customerEmail,
                    customerPhone,
                    shippingAddress: customerAddress,
                    subtotal: subtotal.toString(),
                    shipping: shipping.toString(),
                    total: total.toString(),
                    status: 'processing', // Already paid, so processing
                    paymentStatus: 'paid',
                    paymentMethod: 'stripe',
                    stripePaymentIntentId: paymentIntent.id,
                    notes,
                    createdAt: new Date(),
                });

                const orderId = (orderResult as any)[0].insertId;

                // Insert Order Items and reduce stock
                for (const item of items) {
                    await db.insert(orderItems).values({
                        orderId: orderId,
                        productId: parseInt(item.id),
                        productName: item.name,
                        quantity: item.qty,
                        price: String(item.price),
                        total: String(item.price * item.qty)
                    });

                    // Reduce stock
                    await db
                        .update(products)
                        .set({ stock: sql`${products.stock} - ${item.qty}` })
                        .where(eq(products.id, parseInt(item.id)));
                }

                // Create or update customer record
                try {
                    const [existingCustomer] = await db
                        .select()
                        .from(customers)
                        .where(eq(customers.email, customerEmail))
                        .limit(1);

                    if (existingCustomer) {
                        // Update existing customer
                        await db.update(customers).set({
                            totalOrders: sql`${customers.totalOrders} + 1`,
                            totalSpent: sql`${customers.totalSpent} + ${total}`,
                            lastOrderDate: new Date(),
                            phone: customerPhone || existingCustomer.phone,
                            address: customerAddress || existingCustomer.address,
                        }).where(eq(customers.id, existingCustomer.id));
                    } else {
                        // Create new customer
                        await db.insert(customers).values({
                            email: customerEmail,
                            name: customerName,
                            phone: customerPhone || null,
                            address: customerAddress || null,
                            totalOrders: 1,
                            totalSpent: total.toString(),
                            lastOrderDate: new Date(),
                            source: 'website',
                        });
                    }
                } catch (customerError) {
                    console.error('Failed to update customer record in webhook:', customerError);
                }

                console.log(`Order ${orderNumber} created after successful Stripe payment`);

                // Send order confirmation email
                try {
                    await sendOrderConfirmationEmail({
                        orderNumber,
                        customerName,
                        customerEmail,
                        customerPhone,
                        shippingAddress: customerAddress,
                        items: items.map((item) => ({
                            productName: item.name,
                            quantity: item.qty,
                            price: item.price,
                            total: item.price * item.qty
                        })),
                        subtotal,
                        total,
                        paymentMethod: 'stripe'
                    });
                } catch (emailError) {
                    console.error('Failed to send confirmation email:', emailError);
                }
            } else if (metadata.orderId) {
                // Legacy flow: order was created first, just update status
                await db
                    .update(orders)
                    .set({
                        paymentStatus: 'paid',
                        status: 'processing',
                        paymentMethod: 'stripe',
                        stripePaymentIntentId: paymentIntent.id,
                    })
                    .where(eq(orders.id, parseInt(metadata.orderId)));

                console.log(`Order ${metadata.orderId} marked as paid via Stripe webhook`);
            }
        }

        // Handle payment_intent.payment_failed event
        if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = paymentIntent.metadata?.orderId;

            // Only update if there's an existing order (legacy flow)
            if (orderId) {
                await db
                    .update(orders)
                    .set({
                        paymentStatus: 'failed',
                    })
                    .where(eq(orders.id, parseInt(orderId)));

                console.log(`Order ${orderId} payment failed`);
            }
            // For new flow, payment failed before order creation, so nothing to update
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
