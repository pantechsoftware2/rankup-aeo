import type { Metadata } from "next";
import "./globals.css";
import { ScanProvider } from "@/lib/scan-context";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import VercelAnalytics from "@/components/VercelAnalytics";
import { getOrganizationJsonLd, getRootMetadata, getWebsiteJsonLd } from "@/lib/seo";

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
      <body className="font-sans bg-black text-white antialiased">
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
