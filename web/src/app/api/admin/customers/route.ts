import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { customers, orders } from '@/db/schema';
import { eq, like, or, desc, asc, sql } from 'drizzle-orm';

// GET all customers with filtering and sorting
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const tag = searchParams.get('tag');

        let query = db.select().from(customers);

        // Build conditions
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(customers.name, `%${search}%`),
                    like(customers.email, `%${search}%`),
                    like(customers.phone, `%${search}%`)
                )
            );
        }

        if (tag) {
            conditions.push(like(customers.tags, `%${tag}%`));
        }

        // Execute query
        let result;
        const orderColumn = sortBy === 'totalSpent' ? customers.totalSpent
            : sortBy === 'totalOrders' ? customers.totalOrders
                : sortBy === 'name' ? customers.name
                    : customers.createdAt;

        if (conditions.length > 0) {
            result = await db
                .select()
                .from(customers)
                .where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
                .orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn));
        } else {
            result = await db
                .select()
                .from(customers)
                .orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn));
        }

        // Get summary stats
        const [stats] = await db.select({
            totalCustomers: sql<number>`COUNT(*)`,
            totalSpent: sql<number>`SUM(total_spent)`,
            avgOrderValue: sql<number>`AVG(total_spent / NULLIF(total_orders, 0))`,
        }).from(customers);

        return NextResponse.json({
            customers: result,
            stats: {
                totalCustomers: stats?.totalCustomers || 0,
                totalSpent: stats?.totalSpent || 0,
                avgOrderValue: stats?.avgOrderValue || 0,
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

// POST create new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, phone, address, city, postcode, state, notes, tags, source } = body;

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
        }

        const result = await db.insert(customers).values({
            email,
            name,
            phone: phone || null,
            address: address || null,
            city: city || null,
            postcode: postcode || null,
            state: state || null,
            notes: notes || null,
            tags: tags || null,
            source: source || 'manual',
        });

        const customerId = (result as any)[0].insertId;

        return NextResponse.json({ success: true, customerId }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 });
        }
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
