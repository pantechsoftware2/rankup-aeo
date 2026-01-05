import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google"; // Import the fonts
import "./globals.css";

// 1. Configure the fonts
const inter = Inter({ 
  subsets: ["latin"], 
  variable: '--font-inter',
  display: 'swap',
});

const space = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "RankUp AEO",
  description: "Dominate Search with AEO Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 2. Inject the font variables into the body */}
      <body className={`${inter.variable} ${space.variable} font-sans bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}