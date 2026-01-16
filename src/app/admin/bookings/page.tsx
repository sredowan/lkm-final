import { db } from "@/db";
import { bookings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Calendar, Clock, Phone, Mail, User, FileText } from "lucide-react";

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
};

export default async function AdminBookings() {
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Repair Bookings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage customer repair appointments</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {allBookings.length} bookings
                </span>
            </div>

            <div className="grid gap-4">
                {allBookings.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-sm text-gray-500">Repair bookings will appear here when customers book appointments.</p>
                    </div>
                ) : (
                    allBookings.map((booking) => (
                        <div key={booking.id} className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                {/* Device Info */}
                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[booking.status || 'pending']}`}>
                                            {booking.status}
                                        </span>
                                        <span className="text-xs text-gray-400">#{booking.id}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900">{booking.brand} {booking.model}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{booking.issue}</p>
                                    {booking.price && (
                                        <p className="text-lg font-bold text-blue-600 mt-2">${Number(booking.price).toFixed(2)}</p>
                                    )}
                                </div>

                                {/* Appointment */}
                                <div className="flex-shrink-0">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Appointment</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        {booking.bookingDate}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        {booking.bookingTime}
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="flex-shrink-0">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {booking.customerName}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {booking.customerPhone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {booking.customerEmail}
                                    </div>
                                </div>

                                {/* Notes */}
                                {booking.notes && (
                                    <div className="w-full mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <p className="text-sm text-gray-600">{booking.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
