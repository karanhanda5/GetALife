"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Header() {
  const path = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded || !isSignedIn || path === "/" || path.startsWith("/login")) return null;

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-sand-200"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
        {/* Logo — tapping always goes back to Today / dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 active:opacity-70 transition-opacity touch-manipulation"
        >
          <span className="text-2xl leading-none select-none">🌿</span>
          <span className="font-display text-xl text-bark tracking-tight">GetALife</span>
        </Link>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-1.5 text-sm text-sand-400 font-medium hover:text-coral-500 active:scale-95 transition-all duration-150 touch-manipulation px-2 py-2"
        >
          <SignOutIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
