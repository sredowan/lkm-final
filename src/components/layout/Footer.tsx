import Link from "next/link";
import { Facebook, Instagram, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold text-brand-yellow mb-4">LAKEMBA MOBILE KING</h3>
                        <p className="text-gray-400 mb-4">
                            Your trusted partner for mobile repairs, accessories, and trade-ins.
                            We provide royal treatment for your devices with expert technicians and quality parts.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="bg-gray-800 p-2 rounded-full hover:bg-brand-blue"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="bg-gray-800 p-2 rounded-full hover:bg-brand-blue"><Instagram className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="/" className="hover:text-brand-yellow">Home</Link></li>
                            <li><Link href="/services" className="hover:text-brand-yellow">Repairs</Link></li>
                            <li><Link href="/shop" className="hover:text-brand-yellow">Shop</Link></li>
                            <li><Link href="/contact" className="hover:text-brand-yellow">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Our Services</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="/services/screen-repair" className="hover:text-brand-yellow">Screen Repair</Link></li>
                            <li><Link href="/services/battery-replacement" className="hover:text-brand-yellow">Battery Replacement</Link></li>
                            <li><Link href="/services/water-damage" className="hover:text-brand-yellow">Water Damage</Link></li>
                            <li><Link href="/services/data-recovery" className="hover:text-brand-yellow">Data Recovery</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact Info</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 mt-1 text-brand-yellow" />
                                <span>Shop 2, 52 Railway Parade<br />Lakemba, NSW 2195</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-2 text-brand-yellow" />
                                <span>0410 807 546</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 text-brand-yellow" />
                                <span>lakembamobileking@gmail.com</span>
                            </li>
                            <li className="mt-4">
                                <h4 className="font-semibold text-white">Opening Hours</h4>
                                <p className="text-sm">2:00 PM – 11:00 PM (7 Days)</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Lakemba Mobile King. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
