import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Default payment settings
const DEFAULT_PAYMENT_SETTINGS = {
    stripe: {
        enabled: false,
        testMode: true,
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
    },
    paypal: {
        enabled: false,
        testMode: true,
        clientId: '',
        clientSecret: '',
    },
    afterpay: {
        enabled: false,
        testMode: true,
        merchantId: '',
        secretKey: '',
    },
    inStorePickup: {
        enabled: true,
        instructions: 'Visit our store at Shop 2/118 Haldon St, Lakemba NSW 2195 to complete your purchase.',
    },
    cashOnDelivery: {
        enabled: false,
        instructions: 'Pay with cash when your order is delivered.',
    }
};

// GET payment settings
export async function GET() {
    try {
        const [result] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, 'payment_settings'))
            .limit(1);

        if (result && result.value) {
            return NextResponse.json(JSON.parse(result.value));
        }

        // Return defaults if no settings exist
        return NextResponse.json(DEFAULT_PAYMENT_SETTINGS);
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json(DEFAULT_PAYMENT_SETTINGS);
    }
}

// POST/PUT update payment settings
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Check if settings exist
        const [existing] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, 'payment_settings'))
            .limit(1);

        if (existing) {
            await db
                .update(settings)
                .set({ value: JSON.stringify(body), type: 'json' })
                .where(eq(settings.key, 'payment_settings'));
        } else {
            await db.insert(settings).values({
                key: 'payment_settings',
                value: JSON.stringify(body),
                type: 'json',
                description: 'Payment gateway configuration',
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
