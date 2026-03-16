"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

/**
 * Wrapper that shifts main content down to clear the fixed Header
 * on authenticated pages, and uses normal top-padding elsewhere.
 */
export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const path = usePathname();
  const hasHeader =
    isLoaded && isSignedIn && path !== "/" && !path.startsWith("/login");

  return (
    <main
      className="flex-1 w-full max-w-md mx-auto px-4 pb-32"
      style={{
        // Header is h-14 (3.5rem / 56px) + the safe-area-inset-top (notch).
        // On non-notch phones env() resolves to 0, so pt = 3.75rem = 60px.
        paddingTop: hasHeader
          ? "calc(env(safe-area-inset-top) + 3.75rem)"
          : "1.5rem",
      }}
    >
      {children}
    </main>
  );
}
