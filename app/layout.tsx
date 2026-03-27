import type { Metadata } from "next";
// Keep globals here; do not add <head> — Next injects stylesheets automatically.
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "The Listening Wall",
    template: "%s · The Listening Wall",
  },
  description:
    "Anonymous sharing for teens and parents, built for honesty and care.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
