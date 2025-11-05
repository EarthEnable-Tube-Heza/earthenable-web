import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/Providers";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ropa+Sans:ital@0;1&family=Lato:ital,wght@0,400;0,700;1,400;1,700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,500;1,7..72,600;1,7..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
