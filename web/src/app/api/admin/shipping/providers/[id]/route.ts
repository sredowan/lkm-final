import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shippingProviders } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET single provider
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const providerId = parseInt(id);

        const provider = await db.select().from(shippingProviders).where(eq(shippingProviders.id, providerId));

        if (provider.length === 0) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        // Mask sensitive data
        const masked = {
            ...provider[0],
            apiKey: provider[0].apiKey ? '••••' + provider[0].apiKey.slice(-4) : null,
            apiSecret: provider[0].apiSecret ? '••••' + provider[0].apiSecret.slice(-4) : null,
        };

        return NextResponse.json(masked);
    } catch (error) {
        console.error('Error fetching provider:', error);
        return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 });
    }
}

// PUT update provider
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const providerId = parseInt(id);
        const body = await request.json();
        const { name, code, apiKey, apiSecret, accountNumber, testMode, isActive, settings } = body;

        // Build update object - only include fields that are provided
        const updateData: Record<string, any> = {};

        if (name !== undefined) updateData.name = name;
        if (code !== undefined) updateData.code = code;
        if (apiKey !== undefined && !apiKey.startsWith('••••')) updateData.apiKey = apiKey;
        if (apiSecret !== undefined && !apiSecret.startsWith('••••')) updateData.apiSecret = apiSecret;
        if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
        if (testMode !== undefined) updateData.testMode = testMode;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (settings !== undefined) updateData.settings = JSON.stringify(settings);

        await db.update(shippingProviders).set(updateData).where(eq(shippingProviders.id, providerId));

        return NextResponse.json({ success: true, message: 'Provider updated successfully' });
    } catch (error) {
        console.error('Error updating provider:', error);
        return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
    }
}

// DELETE provider
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const providerId = parseInt(id);

        await db.delete(shippingProviders).where(eq(shippingProviders.id, providerId));

        return NextResponse.json({ success: true, message: 'Provider deleted successfully' });
    } catch (error) {
        console.error('Error deleting provider:', error);
        return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
    }
}
