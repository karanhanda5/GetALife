import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "GetALife — Daily Real-Life Micro Challenges",
  description: "Take meaningful breaks from the internet. 3 daily challenges. Maintain your streak. Actually live.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 w-full max-w-lg mx-auto px-4 pb-28 pt-4">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
