import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'FPL',
  description: 'Track live FPL stats and squad lineups',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FPL',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#00e5ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zooming on mobile pitch interactions
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center font-display">{children}</body>
    </html>
  );
}
