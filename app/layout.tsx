import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AFRO SPORT", description: "African Football Platform" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sw"><body>{children}</body></html>;
}