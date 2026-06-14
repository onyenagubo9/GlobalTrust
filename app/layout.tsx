import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Your updated metadata object with the icons property added
export const metadata: Metadata = {
  title: "GlobalTrust Bank",
  description: "Send and Receive money globally",
  icons: {
    icon: "/globaltrust.jpg", // 👈 This sets your main tab icon (can be .ico, .png, or .svg)
    // apple: "/apple-icon.png", // Optional: For iOS home screen shortcuts
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}