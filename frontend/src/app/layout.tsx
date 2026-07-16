import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IGRIS - Quantitative Trading Platform",
  description: "Institutional-grade strategy builder, historical backtesting, paper trading, and live execution terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
