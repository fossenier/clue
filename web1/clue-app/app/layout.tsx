import type { Metadata } from "next";

// These styles are global, meaning they are applied to the entire app.
import './globals.css';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clue App",
  description: "Play Clue with algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
