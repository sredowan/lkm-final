import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shippingProviders } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all shipping providers
export async function GET() {
    try {
        const providers = await db.select().from(shippingProviders).orderBy(shippingProviders.name);

        // Mask sensitive data for listing
        const maskedProviders = providers.map(p => ({
            ...p,
            apiKey: p.apiKey ? '••••' + p.apiKey.slice(-4) : null,
            apiSecret: p.apiSecret ? '••••' + p.apiSecret.slice(-4) : null,
        }));

        return NextResponse.json(maskedProviders);
    } catch (error) {
        console.error('Error fetching shipping providers:', error);
        return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
    }
}

// POST create new shipping provider
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, code, apiKey, apiSecret, accountNumber, testMode, isActive, settings } = body;

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
        }

        // Check if code already exists
        const existing = await db.select().from(shippingProviders).where(eq(shippingProviders.code, code));
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Provider with this code already exists' }, { status: 400 });
        }

        const result = await db.insert(shippingProviders).values({
            name,
            code,
            apiKey: apiKey || null,
            apiSecret: apiSecret || null,
            accountNumber: accountNumber || null,
            testMode: testMode ?? true,
            isActive: isActive ?? false,
            settings: settings ? JSON.stringify(settings) : null,
        });

        return NextResponse.json({
            success: true,
            id: result[0].insertId,
            message: 'Provider created successfully'
        });
    } catch (error) {
        console.error('Error creating shipping provider:', error);
        return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
    }
}
