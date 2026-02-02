import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, orderRefunds } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendShippedConfirmationEmail } from '@/lib/order-email';

// GET single order with items (supports both numeric ID and order number)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        let order;
        // Check if id is numeric or order number string
        if (/^\d+$/.test(id)) {
            const orderId = parseInt(id);
            [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
        } else {
            // Treat as order number (e.g., LKM-1234567890-123)
            [order] = await db.select().from(orders).where(eq(orders.orderNumber, id)).limit(1);
        }

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Get order items with product details
        const items = await db
            .select({
                id: orderItems.id,
                productId: orderItems.productId,
                productName: orderItems.productName,
                quantity: orderItems.quantity,
                price: orderItems.price,
                total: orderItems.total,
                refundedQuantity: orderItems.refundedQuantity,
            })
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

        // Get refunds
        const refunds = await db
            .select()
            .from(orderRefunds)
            .where(eq(orderRefunds.orderId, order.id));

        return NextResponse.json({ order, items, refunds });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}


// PATCH update order status, payment status, notes
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const orderId = parseInt(id);
        const body = await request.json();

        const updateData: Record<string, any> = {};

        if (body.status) {
            updateData.status = body.status;
        }
        if (body.paymentStatus) {
            updateData.paymentStatus = body.paymentStatus;
        }
        if (body.paymentMethod !== undefined) {
            updateData.paymentMethod = body.paymentMethod;
        }
        if (body.notes !== undefined) {
            updateData.notes = body.notes;
        }
        if (body.trackingNumber !== undefined) {
            updateData.trackingNumber = body.trackingNumber;
        }
        if (body.shippingProvider !== undefined) {
            updateData.shippingProvider = body.shippingProvider;
        }
        if (body.customerName !== undefined) {
            updateData.customerName = body.customerName;
        }
        if (body.customerPhone !== undefined) {
            updateData.customerPhone = body.customerPhone;
        }
        if (body.shippingAddress !== undefined) {
            updateData.shippingAddress = body.shippingAddress;
        }
        if (body.stripePaymentIntentId !== undefined) {
            updateData.stripePaymentIntentId = body.stripePaymentIntentId;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await db.update(orders).set(updateData).where(eq(orders.id, orderId));

        // Return updated order
        const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

        // Send shipped email if status changed to shipped
        if (body.status === 'shipped' && updatedOrder) {
            try {
                // Fetch items for email
                const items = await db
                    .select()
                    .from(orderItems)
                    .where(eq(orderItems.orderId, updatedOrder.id));

                await sendShippedConfirmationEmail({
                    orderNumber: updatedOrder.orderNumber || '',
                    customerName: updatedOrder.customerName || '',
                    customerEmail: updatedOrder.customerEmail || '',
                    customerPhone: updatedOrder.customerPhone || '',
                    shippingAddress: updatedOrder.shippingAddress || '',
                    items: items.map(item => ({
                        productName: item.productName || '',
                        quantity: item.quantity || 0,
                        price: item.price || 0,
                        total: item.total || 0
                    })),
                    subtotal: updatedOrder.subtotal || 0,
                    total: updatedOrder.total || 0,
                    shippingProvider: updatedOrder.shippingProvider,
                    trackingNumber: updatedOrder.trackingNumber
                });
            } catch (emailError) {
                console.error('Failed to send shipping email:', emailError);
                // Don't fail the update if email fails
            }
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
