import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings, shippingZones } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET checkout settings (enabled payment methods + shipping zones)
export async function GET() {
    try {
        // Fetch payment settings
        const [paymentResult] = await db
            .select()
            .from(settings)
            .where(eq(settings.key, 'payment_settings'))
            .limit(1);

        let paymentMethods = {
            stripe: { enabled: false, publicKey: '' },
            paypal: { enabled: false },
            afterpay: { enabled: false },
            cashOnDelivery: { enabled: false, instructions: '' },
            inStorePickup: { enabled: true, instructions: '' },
        };

        if (paymentResult?.value) {
            const parsed = JSON.parse(paymentResult.value);
            paymentMethods = {
                stripe: {
                    enabled: parsed.stripe?.enabled || false,
                    publicKey: parsed.stripe?.publicKey || '',
                },
                paypal: {
                    enabled: parsed.paypal?.enabled || false,
                },
                afterpay: {
                    enabled: parsed.afterpay?.enabled || false,
                },
                cashOnDelivery: {
                    enabled: parsed.cashOnDelivery?.enabled || false,
                    instructions: parsed.cashOnDelivery?.instructions || '',
                },
                inStorePickup: {
                    enabled: parsed.inStorePickup?.enabled || false,
                    instructions: parsed.inStorePickup?.instructions || '',
                },
            };
        }

        // Fetch active shipping zones
        const zones = await db
            .select({
                id: shippingZones.id,
                name: shippingZones.name,
                postcodes: shippingZones.postcodes,
                flatRate: shippingZones.flatRate,
                freeShippingThreshold: shippingZones.freeShippingThreshold,
                weightRate: shippingZones.weightRate,
            })
            .from(shippingZones)
            .where(eq(shippingZones.isActive, true))
            .orderBy(shippingZones.sortOrder);

        return NextResponse.json({
            paymentMethods,
            shippingZones: zones,
        });
    } catch (error) {
        console.error('Error fetching checkout settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch checkout settings' },
            { status: 500 }
        );
    }
}
