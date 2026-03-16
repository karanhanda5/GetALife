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
  maximumScale: 5,          // allow pinch-zoom for accessibility
  viewportFit: "cover",     // extend into notch / dynamic island area
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          <Nav />
          {/* pb-28 leaves room for the fixed bottom nav; pt-safe covers notch on iOS */}
          <main className="flex-1 w-full max-w-md mx-auto px-4 pb-32 pt-6">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
