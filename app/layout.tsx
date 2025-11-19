import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Why Investing Works",
  description: "Animated visualization showing diversified investing through ETFs and direct projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
