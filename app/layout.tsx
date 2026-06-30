import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google"; // Import the fonts
import "./globals.css";
import { ScanProvider } from "@/lib/scan-context";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import VercelAnalytics from "@/components/VercelAnalytics";
import { getOrganizationJsonLd, getRootMetadata, getWebsiteJsonLd } from "@/lib/seo";

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

export const metadata: Metadata = getRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = getOrganizationJsonLd();
  const websiteJsonLd = getWebsiteJsonLd();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${space.variable} font-sans bg-black text-white antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ScanProvider>
          <SiteNav />
          {children}
          <SiteFooter />
        </ScanProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
