import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, customers } from '@/db/schema';
import { eq, like, or, desc, asc, and, sql } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '@/lib/order-email';

// GET orders with optional filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');
        const sortOrder = searchParams.get('sort') || 'desc';

        let query = db.select().from(orders);

        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(orders.orderNumber, `%${search}%`),
                    like(orders.customerName, `%${search}%`),
                    like(orders.customerEmail, `%${search}%`)
                )
            );
        }

        if (status && status !== 'all') {
            conditions.push(eq(orders.status, status));
        }

        if (paymentStatus && paymentStatus !== 'all') {
            conditions.push(eq(orders.paymentStatus, paymentStatus));
        }

        let result;
        if (conditions.length > 0) {
            result = await db
                .select()
                .from(orders)
                .where(and(...conditions))
                .orderBy(sortOrder === 'asc' ? asc(orders.createdAt) : desc(orders.createdAt));
        } else {
            result = await db
                .select()
                .from(orders)
                .orderBy(sortOrder === 'asc' ? asc(orders.createdAt) : desc(orders.createdAt));
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer, items, total, paymentMethod } = body;

        // Basic server-side validation
        if (!customer || !items || !items.length) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        // Check stock availability and reduce stock
        for (const item of items) {
            const [product] = await db
                .select({ stock: products.stock })
                .from(products)
                .where(eq(products.id, parseInt(item.id)))
                .limit(1);

            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
            }

            const currentStock = product.stock || 0;
            if (currentStock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for ${item.name}. Available: ${currentStock}` },
                    { status: 400 }
                );
            }
        }

        // Generate Order Number
        const orderNumber = `LKM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Insert Order
        const orderResult = await db.insert(orders).values({
            orderNumber,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            shippingAddress: customer.address,
            subtotal: total,
            total: total,
            status: 'pending',
            paymentStatus: 'unpaid',
            paymentMethod: paymentMethod || null,
            createdAt: new Date(),
        });

        const orderId = (orderResult as any)[0].insertId;

        // Insert Order Items and reduce stock
        const itemsToInsert = [];
        for (const item of items) {
            itemsToInsert.push({
                orderId: orderId,
                productId: parseInt(item.id),
                productName: item.name,
                quantity: item.quantity,
                price: String(item.price),
                total: String(item.price * item.quantity)
            });

            // Reduce stock
            await db
                .update(products)
                .set({ stock: sql`${products.stock} - ${item.quantity}` })
                .where(eq(products.id, parseInt(item.id)));
        }

        await db.insert(orderItems).values(itemsToInsert);

        // Create or update customer record
        try {
            const [existingCustomer] = await db
                .select()
                .from(customers)
                .where(eq(customers.email, customer.email))
                .limit(1);

            if (existingCustomer) {
                // Update existing customer
                await db.update(customers).set({
                    totalOrders: sql`${customers.totalOrders} + 1`,
                    totalSpent: sql`${customers.totalSpent} + ${total}`,
                    lastOrderDate: new Date(),
                    phone: customer.phone || existingCustomer.phone,
                    address: customer.address || existingCustomer.address,
                }).where(eq(customers.id, existingCustomer.id));
            } else {
                // Create new customer
                await db.insert(customers).values({
                    email: customer.email,
                    name: customer.name,
                    phone: customer.phone || null,
                    address: customer.address || null,
                    totalOrders: 1,
                    totalSpent: total.toString(),
                    lastOrderDate: new Date(),
                    source: 'website',
                });
            }
        } catch (customerError) {
            console.error('Failed to update customer record:', customerError);
            // Don't fail the order if customer update fails
        }

        // Send order confirmation email
        try {
            await sendOrderConfirmationEmail({
                orderNumber,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                shippingAddress: customer.address,
                items: items.map((item: any) => ({
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                subtotal: total,
                total: total,
                paymentMethod: paymentMethod
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the order if email fails
        }

        return NextResponse.json({ success: true, orderNumber, orderId: orderId }, { status: 201 });

    } catch (error) {
        console.error("Order creation failed:", error);
        return NextResponse.json({ error: 'Failed to create order', details: error }, { status: 500 });
    }
}

