import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Hanken_Grotesk, Instrument_Sans } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ClientProviders from "@/components/providers/ClientProviders";
import SmoothScroll from "@/components/common/SmoothScroll";
import { Toaster } from "react-hot-toast";
import { PostHogProvider } from "@/providers/posthog-provider";
import NewsletterPopup from "@/components/common/NewsletterPopup";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jfs-wears.com"),
  title: {
    default: "JFS Wears | Premium Nigerian Fashion",
    template: "%s | JFS Wears",
  },
  description: "Elevate your style with JFS Wears. The best in modern Nigerian fashion.",
  keywords: ["Nigerian fashion", "premium wear", "JFS Wears", "African fashion", "clothing store"],
  alternates: {
    canonical: "./",
  },
  authors: [{ name: "JFS Wears" }],
  creator: "JFS Wears",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://jfs-wears.com",
    title: "JFS Wears | Premium Nigerian Fashion",
    description: "Elevate your style with JFS Wears. The best in modern Nigerian fashion.",
    siteName: "JFS Wears",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "JFS Wears",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JFS Wears | Premium Nigerian Fashion",
    description: "Elevate your style with JFS Wears. The best in modern Nigerian fashion.",
    images: ["/opengraph-image"],
    creator: "@jfswears",
  },
  verification: {
    google: "google-site-verification=PLACEHOLDER", // User to replace
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JFS Wears",
    url: "https://jfs-wears.com",
    logo: "https://jfs-wears.com/logo.png",
    sameAs: [],
  };

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body
        className={`${hankenGrotesk.variable} ${instrumentSans.variable} min-h-screen flex flex-col font-sans antialiased text-primary bg-secondary`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Toaster position="top-right" />
        <PostHogProvider>
          <ClientProviders>
            <SmoothScroll>
              <ConditionalLayout>{children}</ConditionalLayout>
            </SmoothScroll>
            <NewsletterPopup />
          </ClientProviders>
        </PostHogProvider>
      </body>
    </html>
  );
}
