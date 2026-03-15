"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import StreakDisplay from "@/components/StreakDisplay";

interface UserProfile {
  name: string; email: string; image: string | null;
  current_streak: number; longest_streak: number;
  total_points: number; created_at: string;
}

interface HistoryEntry {
  title: string; difficulty: string; points: number;
  completed_at: string; assigned_date: string;
}

const difficultyColor: Record<string, string> = {
  easy: "text-moss-500", medium: "text-amber-600", hard: "text-coral-500",
};

export default function ProfilePage() {
  const { signOut } = useClerk();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => {
      setUser(d.user); setHistory(d.history || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-sm text-sand-400 font-medium">Loading profile…</p></div>;
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-sand-100 mx-auto flex items-center justify-center text-3xl font-bold text-bark mb-3">
          {user.name?.[0]?.toUpperCase() || "?"}
        </div>
        <h1 className="font-display text-2xl text-bark">{user.name}</h1>
        <p className="text-sm text-sand-400 mt-0.5">Member since {memberSince}</p>
      </div>

      <div className="animate-fade-up delay-100">
        <StreakDisplay current={user.current_streak} longest={user.longest_streak} />
      </div>

      <div className="animate-fade-up delay-200 grid grid-cols-3 gap-3">
        {[
          { label: "Points", value: user.total_points.toLocaleString(), emoji: "⭐" },
          { label: "Best Streak", value: `${user.longest_streak}d`, emoji: "🏅" },
          { label: "Completed", value: history.length.toString(), emoji: "✅" },
        ].map((s) => (
          <div key={s.label} className="card border border-sand-200 text-center py-4">
            <span className="text-xl block mb-1">{s.emoji}</span>
            <div className="font-display text-xl text-bark">{s.value}</div>
            <div className="text-[11px] text-sand-400 font-semibold uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="animate-fade-up delay-300">
        <h2 className="text-xs font-semibold text-sand-400 uppercase tracking-wider mb-3">Recent Completions</h2>
        {history.length === 0 ? (
          <div className="card border border-sand-200 text-center py-8">
            <span className="text-3xl block mb-2">🫣</span>
            <p className="text-sm text-sand-400">Nothing here yet. Go complete a challenge!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="card border border-sand-200 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-bark truncate">{h.title}</p>
                  <p className="text-[11px] text-sand-400">
                    {new Date(h.assigned_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" · "}<span className={difficultyColor[h.difficulty]}>{h.difficulty}</span>
                  </p>
                </div>
                <span className="font-mono text-sm text-sand-400 shrink-0">+{h.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="animate-fade-up pt-4">
        <button onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full text-sm text-coral-500 font-semibold py-3 rounded-2xl border border-coral-100 hover:bg-coral-50 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
