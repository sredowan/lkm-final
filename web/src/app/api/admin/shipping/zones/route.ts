import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shippingZones } from "@/db/schema";
import { asc } from "drizzle-orm";

// GET all shipping zones
export async function GET() {
    try {
        const zones = await db.select().from(shippingZones).orderBy(asc(shippingZones.sortOrder));
        return NextResponse.json(zones);
    } catch (error) {
        console.error('Error fetching shipping zones:', error);
        return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 });
    }
}

// POST create new shipping zone
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, postcodes, flatRate, freeShippingThreshold, weightRate, isActive, sortOrder } = body;

        if (!name) {
            return NextResponse.json({ error: 'Zone name is required' }, { status: 400 });
        }

        const result = await db.insert(shippingZones).values({
            name,
            postcodes: postcodes || null,
            flatRate: flatRate?.toString() || null,
            freeShippingThreshold: freeShippingThreshold?.toString() || null,
            weightRate: weightRate?.toString() || null,
            isActive: isActive ?? true,
            sortOrder: sortOrder ?? 0,
        });

        return NextResponse.json({
            success: true,
            id: result[0].insertId,
            message: 'Zone created successfully'
        });
    } catch (error) {
        console.error('Error creating shipping zone:', error);
        return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 });
    }
}
