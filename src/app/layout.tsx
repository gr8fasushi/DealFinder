import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DealFinder - Best Deals from Top Retailers",
  description: "Find the latest and greatest deals from Amazon, Walmart, Newegg, and more. Save money on electronics, home goods, and everything in between.",
  keywords: ["deals", "discounts", "savings", "Amazon", "Walmart", "Newegg", "shopping"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
