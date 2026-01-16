import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Typography following brand guidelines
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-poppins",
    display: "swap"
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap"
});

export const metadata: Metadata = {
    title: "Brand Repairs | Lakemba Mobile King",
    description: "Professional mobile phone repairs in Lakemba with 6-month warranty.",
};

export default function BrandsLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${poppins.variable} ${inter.variable}`}>
            {/* Transparent Header */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Header className="bg-white/95 backdrop-blur-md shadow-lg" />
            </div>

            {/* Main Content */}
            <main className="font-[var(--font-inter)]">
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
