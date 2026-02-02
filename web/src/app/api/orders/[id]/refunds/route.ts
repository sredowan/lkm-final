import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { orders, orderItems, orderRefunds, products, settings } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orderId = parseInt(id);
        const body = await request.json();

        const {
            amount,
            reason,
            refundedItems, // Array of { productId, quantity }
            isShippingRefunded,
            restockItems
        } = body;

        // 1. Fetch Order
        const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const refundAmount = parseFloat(amount);
        if (isNaN(refundAmount) || refundAmount <= 0) {
            return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 });
        }

        const currentTotalRefunded = parseFloat(order.totalRefunded || '0');
        const orderTotal = parseFloat(order.total);
        if (currentTotalRefunded + refundAmount > orderTotal + 0.01) { // 0.01 for rounding
            return NextResponse.json({ error: 'Refund amount exceeds order total' }, { status: 400 });
        }

        let stripeRefundId = null;

        // 2. Process Stripe Refund if applicable
        if (order.paymentMethod === 'stripe') {
            if (!order.stripePaymentIntentId) {
                console.error(`Order ${orderId}: Missing stripePaymentIntentId, cannot process Stripe refund.`);
                return NextResponse.json({
                    error: 'Cannot process Stripe refund: Payment Intent ID is missing. This order may have been created before the refund system was fully implemented, or it was not a Stripe payment.'
                }, { status: 400 });
            }

            // Fetch Stripe credentials from settings
            const [paymentSettings] = await db
                .select()
                .from(settings)
                .where(eq(settings.key, 'payment_settings'))
                .limit(1);

            if (!paymentSettings?.value) {
                return NextResponse.json({ error: 'Payment settings not configured in admin' }, { status: 500 });
            }

            const parsedSettings = JSON.parse(paymentSettings.value);
            const stripeSecretKey = parsedSettings.stripe?.secretKey;

            if (!stripeSecretKey) {
                return NextResponse.json({ error: 'Stripe secret key not configured in payment settings' }, { status: 500 });
            }

            const stripe = new Stripe(stripeSecretKey, {
                apiVersion: '2025-12-15.clover',
            });

            console.log(`Processing Stripe refund for PI: ${order.stripePaymentIntentId}, Amount: $${refundAmount}`);
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: order.stripePaymentIntentId,
                    amount: Math.round(refundAmount * 100), // Stripe expects cents
                    reason: 'requested_by_customer',
                });
                stripeRefundId = refund.id;
                console.log(`Stripe refund successful! Refund ID: ${stripeRefundId}`);
            } catch (stripeError: any) {
                console.error('Stripe refund failed:', stripeError);
                return NextResponse.json({
                    error: `Stripe refund failed: ${stripeError.message}`
                }, { status: 400 });
            }
        }

        // 3. Update Database in Transaction
        await db.transaction(async (tx) => {
            // a. Create Refund Record
            await tx.insert(orderRefunds).values({
                orderId,
                amount: refundAmount.toString(),
                reason: reason || 'Refund issued by admin',
                refundedItems: JSON.stringify(refundedItems || []),
                isShippingRefunded: !!isShippingRefunded,
                stripeRefundId,
                createdAt: new Date(),
            });

            // b. Update Order status and total refunded
            const newTotalRefunded = currentTotalRefunded + refundAmount;
            const isFullRefund = Math.abs(newTotalRefunded - orderTotal) < 0.05;

            await tx.update(orders).set({
                totalRefunded: newTotalRefunded.toString(),
                refundStatus: isFullRefund ? 'full' : 'partial',
                paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
            }).where(eq(orders.id, orderId));

            // c. Update Order items refunded quantity and Products stock
            if (refundedItems && Array.isArray(refundedItems)) {
                for (const item of refundedItems) {
                    // Update order_items table
                    await tx.update(orderItems)
                        .set({
                            refundedQuantity: sql`${orderItems.refundedQuantity} + ${item.quantity}`
                        })
                        .where(sql`${orderItems.orderId} = ${orderId} AND ${orderItems.productId} = ${item.productId}`);

                    // Restock if requested
                    if (restockItems) {
                        await tx.update(products)
                            .set({
                                stock: sql`${products.stock} + ${item.quantity}`
                            })
                            .where(eq(products.id, item.productId));
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Refund processed successfully',
            refundStatus: (currentTotalRefunded + refundAmount >= orderTotal - 0.05) ? 'full' : 'partial'
        });

    } catch (error: any) {
        console.error('Refund processing failed:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
