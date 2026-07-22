import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetailCell - Operasyon Merkezi",
  description: "Gerçek zamanlı tedarik zinciri optimizasyonu için YZ destekli Bayi Envanter Yönetim Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
