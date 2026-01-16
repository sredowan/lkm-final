import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer, items, total } = body;

        // Basic server-side validation
        if (!customer || !items || !items.length) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        // Generate Order Number
        const orderNumber = `LKM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Insert Order
        // Note: Drizzle's MySQL insert returns a ResultSetHeader which has insertId
        const orderResult = await db.insert(orders).values({
            orderNumber,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            shippingAddress: customer.address,
            subtotal: total, // For simplicity assuming subtotal == total for now (tax/shipping logic can be added)
            total: total,
            status: 'pending',
            paymentStatus: 'unpaid',
            createdAt: new Date(),
        });

        const orderId = (orderResult as any)[0].insertId;

        // Insert Order Items
        const itemsToInsert = items.map((item: any) => ({
            orderId: orderId,
            productId: parseInt(item.id),
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
        }));

        await db.insert(orderItems).values(itemsToInsert);

        return NextResponse.json({ success: true, orderNumber, id: orderId }, { status: 201 });

    } catch (error) {
        console.error("Order creation failed:", error);
        return NextResponse.json({ error: 'Failed to create order', details: error }, { status: 500 });
    }
}
