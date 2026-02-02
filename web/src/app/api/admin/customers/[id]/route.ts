import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, orders, orderItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET single customer with order history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);

        const [customer] = await db
            .select()
            .from(customers)
            .where(eq(customers.id, customerId))
            .limit(1);

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Get customer's order history
        const customerOrders = await db
            .select()
            .from(orders)
            .where(eq(orders.customerEmail, customer.email))
            .orderBy(desc(orders.createdAt));

        // Get order items for each order
        const ordersWithItems = await Promise.all(
            customerOrders.map(async (order) => {
                const items = await db
                    .select()
                    .from(orderItems)
                    .where(eq(orderItems.orderId, order.id));
                return { ...order, items };
            })
        );

        return NextResponse.json({
            customer,
            orders: ordersWithItems,
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
    }
}

// PATCH update customer
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);
        const body = await request.json();

        const updateData: Record<string, any> = {};

        const allowedFields = ['name', 'phone', 'address', 'city', 'postcode', 'state', 'notes', 'tags', 'isActive'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await db.update(customers).set(updateData).where(eq(customers.id, customerId));

        const [updatedCustomer] = await db
            .select()
            .from(customers)
            .where(eq(customers.id, customerId))
            .limit(1);

        return NextResponse.json({ success: true, customer: updatedCustomer });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

// DELETE customer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customerId = parseInt(id);

        await db.delete(customers).where(eq(customers.id, customerId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
