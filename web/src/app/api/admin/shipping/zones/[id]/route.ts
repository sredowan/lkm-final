import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shippingZones } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single zone
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const zoneId = parseInt(id);

        const zone = await db.select().from(shippingZones).where(eq(shippingZones.id, zoneId));

        if (zone.length === 0) {
            return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }

        return NextResponse.json(zone[0]);
    } catch (error) {
        console.error('Error fetching zone:', error);
        return NextResponse.json({ error: 'Failed to fetch zone' }, { status: 500 });
    }
}

// PUT update zone
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const zoneId = parseInt(id);
        const body = await request.json();
        const { name, postcodes, flatRate, freeShippingThreshold, weightRate, isActive, sortOrder } = body;

        const updateData: Record<string, any> = {};

        if (name !== undefined) updateData.name = name;
        if (postcodes !== undefined) updateData.postcodes = postcodes;
        if (flatRate !== undefined) updateData.flatRate = flatRate?.toString();
        if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = freeShippingThreshold?.toString();
        if (weightRate !== undefined) updateData.weightRate = weightRate?.toString();
        if (isActive !== undefined) updateData.isActive = isActive;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        await db.update(shippingZones).set(updateData).where(eq(shippingZones.id, zoneId));

        return NextResponse.json({ success: true, message: 'Zone updated successfully' });
    } catch (error) {
        console.error('Error updating zone:', error);
        return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 });
    }
}

// DELETE zone
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const zoneId = parseInt(id);

        await db.delete(shippingZones).where(eq(shippingZones.id, zoneId));

        return NextResponse.json({ success: true, message: 'Zone deleted successfully' });
    } catch (error) {
        console.error('Error deleting zone:', error);
        return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 });
    }
}
