import nodemailer from 'nodemailer';

interface OrderItem {
    productName: string;
    quantity: number;
    price: number | string;
    total: number | string;
}

interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    items: OrderItem[];
    subtotal: number | string;
    total: number | string;
    paymentMethod?: string;
    shippingProvider?: string | null;
    trackingNumber?: string | null;
    createdAt?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const itemsHtml = data.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.price).toFixed(2)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.total).toFixed(2)}</td>
            </tr>
        `
        )
        .join('');

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; background: #18184b; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Lakemba Mobile King</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Order Confirmation</p>
        </div>

        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #18184b; margin-top: 0;">Thank you for your order!</h2>
            <p style="color: #6b7280;">Hi ${data.customerName}, we've received your order and will process it shortly.</p>

            <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Order Number</p>
                <p style="margin: 0; color: #18184b; font-size: 20px; font-weight: bold;">${data.orderNumber}</p>
            </div>

            <h3 style="color: #18184b; border-bottom: 2px solid #18184b; padding-bottom: 10px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f3f4f6;">
                        <th style="padding: 12px; text-align: left; color: #374151;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #374151;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #374151;">Price</th>
                        <th style="padding: 12px; text-align: right; color: #374151;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold; color: #18184b; font-size: 18px;">$${Number(data.total).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <h3 style="color: #18184b; border-bottom: 2px solid #18184b; padding-bottom: 10px; margin-top: 30px;">Shipping Details</h3>
            <div style="background: white; border-radius: 8px; padding: 15px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 5px;"><strong>${data.customerName}</strong></p>
                <p style="margin: 0 0 5px; color: #6b7280;">${data.customerEmail}</p>
                <p style="margin: 0 0 5px; color: #6b7280;">${data.customerPhone}</p>
                <p style="margin: 0; color: #6b7280;">${data.shippingAddress}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding: 25px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
                <p style="margin: 0 0 15px; color: #1e40af; font-weight: bold;">Want to see where your order is?</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lakembamobile.com.au'}/track-order/${data.orderNumber}" 
                   style="background: #1e40af; color: white; padding: 12px 25px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                    Track Your Order
                </a>
                <p style="margin: 15px 0 0; color: #60a5fa; font-size: 13px;">Estimated Delivery: 2-3 Business Days</p>
            </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Lakemba Mobile King</p>
            <p style="margin: 5px 0;">Shop 2/118 Haldon St, Lakemba NSW 2195</p>
            <p style="margin: 5px 0;">Phone: (02) 9740 5353</p>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Lakemba Mobile King" <${process.env.EMAIL_USER}>`,
            to: data.customerEmail,
            subject: `Order Confirmation - ${data.orderNumber}`,
            html: htmlContent,
        });
        console.log('Order confirmation email sent to:', data.customerEmail);
        return true;
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        return false;
    }
}

export async function sendShippedConfirmationEmail(data: OrderEmailData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const providerMap: Record<string, string> = {
        'aus_post': 'Australia Post',
        'sendle': 'Sendle',
        'startrack': 'StarTrack',
        'dhl': 'DHL Express',
        'other': 'Our Carrier'
    };

    const providerName = providerMap[data.shippingProvider || 'other'] || 'Our Carrier';

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 25px 0; background: #1e40af; color: white; border-radius: 12px 12px 0 0;">
            <div style="font-size: 40px; margin-bottom: 10px;">🚚</div>
            <h1 style="margin: 0; font-size: 24px;">Your order is on its way!</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Great news! Your package has been shipped.</p>
        </div>

        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="color: #4b5563; line-height: 1.6;">Good news! We've dispatched your order <strong>${data.orderNumber}</strong>. It's now being handled by <strong>${providerName}</strong>.</p>

            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px dashed #cbd5e1; text-align: center;">
                <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">Tracking Number</p>
                <p style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: bold; font-family: monospace; border: 1px solid #e2e8f0; background: white; padding: 10px; display: inline-block;">${data.trackingNumber || 'N/A'}</p>
                
                <div style="margin-top: 10px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lakembamobile.com.au'}/track-order/${data.orderNumber}" 
                       style="background: #1e40af; color: white; padding: 14px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        Track My Package
                    </a>
                </div>
            </div>

            <div style="grid-template-cols: 1fr 1fr; display: grid; gap: 20px; margin-top: 30px;">
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px;">
                    <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase;">Carrier</p>
                    <p style="margin: 0; font-weight: bold; color: #1e293b;">${providerName}</p>
                </div>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px;">
                    <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase;">Estimate</p>
                    <p style="margin: 0; font-weight: bold; color: #1e293b;">2-3 Business Days</p>
                </div>
            </div>

            <h3 style="color: #1e293b; margin-top: 35px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Shipping To</h3>
            <p style="color: #4b5563; line-height: 1.5; background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>${data.customerName}</strong><br>
                ${data.shippingAddress}
            </p>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px;">Questions? Reply to this email or call us at (02) 9740 5353</p>
            </div>
        </div>

        <div style="text-align: center; padding: 30px; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0; font-weight: bold;">Lakemba Mobile King</p>
            <p style="margin: 5px 0;">Shop 2/118 Haldon St, Lakemba NSW 2195</p>
            <p style="margin: 10px 0;">© ${new Date().getFullYear()} Lakemba Mobile King. All rights reserved.</p>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Lakemba Mobile King" <${process.env.EMAIL_USER}>`,
            to: data.customerEmail,
            subject: `Shipping Confirmation - Your order ${data.orderNumber} is on its way!`,
            html: htmlContent,
        });
        console.log('Shipped confirmation email sent to:', data.customerEmail);
        return true;
    } catch (error) {
        console.error('Failed to send shipped confirmation email:', error);
        return false;
    }
}
