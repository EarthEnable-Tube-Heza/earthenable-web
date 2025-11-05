import type { Metadata } from "next";
import { Ropa_Sans, Lato, Literata } from "next/font/google";
import "./globals.css";

const ropaSans = Ropa_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ropa-sans",
  display: "swap",
});

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

const literata = Literata({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EarthEnable Dashboard",
  description: "Admin and manager web dashboard for EarthEnable field operations management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ropaSans.variable} ${lato.variable} ${literata.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
