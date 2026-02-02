
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            brand,
            model,
            issue,
            price,
            bookingDate,
            bookingTime,
            customerName,
            customerEmail,
            customerPhone,
            notes
        } = body;

        // Validation
        if (!brand || !model || !issue || !bookingDate || !bookingTime || !customerName || !customerEmail || !customerPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Insert into Database
        await db.insert(bookings).values({
            brand,
            model,
            issue,
            price: price ? price.toString() : null,
            bookingDate,
            bookingTime,
            customerName,
            customerEmail,
            customerPhone,
            notes,
            status: 'pending'
        });

        // 2. Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // e.g. aarsayem002@gmail.com
                pass: process.env.EMAIL_PASS  // App Password
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'redowansayem73@gmail.com',
            subject: `New Repair Booking: ${customerName} - ${brand} ${model}`,
            html: `
                <h2>New Repair Booking Request</h2>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Phone:</strong> ${customerPhone}</p>
                <hr>
                <h3>Device Details</h3>
                <p><strong>Device:</strong> ${brand} ${model}</p>
                <p><strong>Issue:</strong> ${issue}</p>
                <p><strong>Estimated Price:</strong> $${price}</p>
                <hr>
                <h3>Appointment</h3>
                <p><strong>Date:</strong> ${bookingDate}</p>
                <p><strong>Time:</strong> ${bookingTime}</p>
                <p><strong>Notes:</strong> ${notes || 'None'}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Booking received' }, { status: 201 });

    } catch (error: any) {
        console.error('Booking error:', error);
        return NextResponse.json({
            error: 'Failed to process booking',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
