"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationBanner() {
  const { status, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  // Don't show anything if push isn't supported or permission is denied
  if (status === "unsupported" || status === "denied") return null;
  // Don't show once subscribed (show a small "on" indicator instead)
  if (isSubscribed) {
    return (
      <div className="flex items-center justify-between bg-moss-50 border border-moss-200 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🔔</span>
          <p className="text-sm font-medium text-moss-600">Daily notifications on</p>
        </div>
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="text-xs text-sand-400 underline underline-offset-2 touch-manipulation disabled:opacity-50"
        >
          {loading ? "…" : "Turn off"}
        </button>
      </div>
    );
  }

  return (
    <div className="card border border-sand-200 flex items-start gap-3 py-4">
      <span className="text-2xl shrink-0 mt-0.5">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-bark text-sm">Get daily reminders</p>
        <p className="text-xs text-sand-400 mt-0.5 leading-snug">
          We&apos;ll ping you each morning when your 3 new challenges are ready.
        </p>
      </div>
      <button
        onClick={subscribe}
        disabled={loading}
        className="shrink-0 bg-bark text-cream text-xs font-semibold px-4 py-2.5 rounded-2xl active:scale-95 transition-all touch-manipulation disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? "…" : "Enable"}
      </button>
    </div>
  );
}
