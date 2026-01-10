import type { Metadata } from "next";
import { Hanken_Grotesk, Instrument_Sans } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ClientProviders from "@/components/providers/ClientProviders";
import { Toaster } from "react-hot-toast";

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
  title: "JFS Wears | Premium Nigerian Fashion",
  description: "Elevate your style with JFS Wears. The best in modern Nigerian fashion.",
  icons: {
    icon: "/logo.png",
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
        className={`${hankenGrotesk.variable} ${instrumentSans.variable} min-h-screen flex flex-col font-sans antialiased text-primary bg-secondary`}
      >
        <Toaster position="top-right" />
        <ClientProviders>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
