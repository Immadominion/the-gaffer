import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { SessionProvider } from "@/lib/session";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "The Gaffer — the manager who never forgets",
  description:
    "Stake WAL on the World Cup. Back your judgement. The Gaffer remembers every call, coaches you, and roasts you when you bottle it. Built on Sui & Walrus.",
  icons: { icon: "/img/logo.png" },
  openGraph: {
    title: "The Gaffer — the manager who never forgets",
    description:
      "Stake WAL on the matches. The Gaffer tracks your record on-chain, coaches you, and roasts you when you bottle it.",
    images: ["/img/gaffer.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <SessionProvider>{children}</SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
