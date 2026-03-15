"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  name: string;
  image: string | null;
  current_streak: number;
  longest_streak: number;
  total_points: number;
}

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard").then((r) => r.json()).then((d) => setEntries(d.leaderboard || [])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="text-sm text-sand-400 font-medium">Loading leaderboard…</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-up">
        <span className="text-4xl block mb-2">🏆</span>
        <h1 className="font-display text-3xl text-bark">Leaderboard</h1>
        <p className="text-sm text-sand-400 mt-1">Who&apos;s actually living?</p>
      </div>

      {entries.length >= 3 && (
        <div className="animate-fade-up delay-100 flex justify-center items-end gap-3 pt-4 pb-2">
          {[1, 0, 2].map((idx) => {
            const e = entries[idx];
            const isFirst = idx === 0;
            return (
              <div key={idx} className={`text-center flex flex-col items-center ${isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"}`}>
                <span className={`text-3xl ${isFirst ? "text-4xl" : ""}`}>{medals[idx]}</span>
                <div className={`w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center text-lg font-bold text-bark mt-1 ${isFirst ? "w-14 h-14 ring-2 ring-moss-400 ring-offset-2" : ""}`}>
                  {e.name?.[0]?.toUpperCase() || "?"}
                </div>
                <p className="text-xs font-semibold text-bark mt-1.5 max-w-[80px] truncate">{e.name || "Anon"}</p>
                <p className="text-[11px] text-sand-400 font-mono">{e.total_points} pts</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2 animate-fade-up delay-200">
        {entries.map((e, i) => (
          <div key={i} className={`card border py-4 flex items-center gap-4 ${i < 3 ? "border-moss-200 bg-moss-50/50" : "border-sand-200"}`}>
            <span className="w-8 text-center font-mono text-sm text-sand-400 shrink-0">{i < 3 ? medals[i] : `#${i + 1}`}</span>
            <div className="w-9 h-9 rounded-full bg-sand-100 flex items-center justify-center text-sm font-bold text-bark shrink-0">{e.name?.[0]?.toUpperCase() || "?"}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bark truncate">{e.name || "Anonymous"}</p>
              <p className="text-[11px] text-sand-400">🔥 {e.current_streak} day streak</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-semibold text-bark">{e.total_points.toLocaleString()}</p>
              <p className="text-[11px] text-sand-400">pts</p>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="card border border-sand-200 text-center py-12">
            <span className="text-4xl block mb-3">🦗</span>
            <p className="text-sm text-sand-400">No one here yet. Be the first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
