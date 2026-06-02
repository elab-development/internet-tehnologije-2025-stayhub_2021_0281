import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EazyProperties",
  description: "Simple property management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}