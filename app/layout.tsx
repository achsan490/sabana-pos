import type { Metadata } from "next";
import { Inter, Outfit, Lilita_One } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

const lilita = Lilita_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-lilita",
});

export const metadata: Metadata = {
    title: "Sabana Fried Chicken - POS",
    description: "Professional Point of Sale system for Sabana Fried Chicken",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} ${lilita.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
