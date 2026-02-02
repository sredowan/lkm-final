import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, products, bookings } from '@/db/schema';
import { sql, desc, count, sum } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get total orders and revenue
        const [orderStats] = await db.select({
            totalOrders: count(),
            totalRevenue: sum(orders.total),
        }).from(orders);

        // Get total products
        const [productStats] = await db.select({
            totalProducts: count(),
        }).from(products);

        // Get total bookings
        const [bookingStats] = await db.select({
            totalBookings: count(),
        }).from(bookings);

        // Get recent orders
        const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);

        // Get orders by day (last 7 days) - simplified mock data for now
        const today = new Date();
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            chartData.push({
                name: dayName,
                revenue: Math.floor(Math.random() * 500) + 100, // Placeholder - replace with real data
                orders: Math.floor(Math.random() * 10) + 1,
            });
        }

        return NextResponse.json({
            stats: {
                totalOrders: Number(orderStats?.totalOrders) || 0,
                totalRevenue: Number(orderStats?.totalRevenue) || 0,
                totalProducts: Number(productStats?.totalProducts) || 0,
                totalBookings: Number(bookingStats?.totalBookings) || 0,
            },
            recentOrders,
            chartData,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
