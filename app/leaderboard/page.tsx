"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  name: string;
  image: string | null;
  current_streak: number;
  full_streak: number;
  longest_full_streak: number;
  total_points: number;
}

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setEntries(d.leaderboard || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-sand-400 font-medium">Loading leaderboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="text-center animate-fade-up">
        <span className="text-4xl block mb-2">🏆</span>
        <h1 className="font-display text-3xl text-bark">Leaderboard</h1>
        <p className="text-sm text-sand-400 mt-1">Who&apos;s actually living?</p>
      </div>

      {/* Ranking explanation */}
      <div className="animate-fade-up delay-100 bg-moss-50 border border-moss-200 rounded-2xl px-4 py-3">
        <p className="text-xs text-moss-700 text-center leading-relaxed">
          <span className="font-semibold">Ranked by Full-Day Streak</span> — complete all 3 challenges every day to climb. Ties broken by total points.
        </p>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="animate-fade-up delay-100 flex justify-center items-end gap-4 pt-2 pb-1">
          {([1, 0, 2] as const).map((idx) => {
            const e = entries[idx];
            const isFirst = idx === 0;
            return (
              <div
                key={idx}
                className={`text-center flex flex-col items-center ${
                  isFirst ? "order-2" : idx === 1 ? "order-1" : "order-3"
                }`}
              >
                <span className={isFirst ? "text-4xl" : "text-3xl"}>{medals[idx]}</span>
                <div
                  className={`rounded-full bg-sand-100 flex items-center justify-center font-bold text-bark mt-1 ${
                    isFirst
                      ? "w-16 h-16 text-xl ring-2 ring-moss-400 ring-offset-2"
                      : "w-12 h-12 text-base"
                  }`}
                >
                  {e.name?.[0]?.toUpperCase() || "?"}
                </div>
                <p className="text-xs font-semibold text-bark mt-1.5 max-w-[72px] truncate">
                  {e.name || "Anon"}
                </p>
                <p className="text-[11px] text-moss-600 font-semibold">
                  🔥 {e.full_streak}d full
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2 animate-fade-up delay-200">
        {entries.map((e, i) => (
          <div
            key={i}
            className={`card border py-3.5 flex items-center gap-3 ${
              i < 3 ? "border-moss-200 bg-moss-50/50" : "border-sand-200"
            }`}
          >
            <span className="w-8 text-center font-mono text-sm text-sand-400 shrink-0">
              {i < 3 ? medals[i] : `#${i + 1}`}
            </span>
            <div className="w-9 h-9 rounded-full bg-sand-100 flex items-center justify-center text-sm font-bold text-bark shrink-0">
              {e.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-bark truncate">{e.name || "Anonymous"}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-moss-600 font-semibold">
                  🔥 {e.full_streak} day{e.full_streak !== 1 ? "s" : ""} full streak
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-semibold text-bark">
                {e.total_points.toLocaleString()}
              </p>
              <p className="text-[11px] text-sand-400">pts</p>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="card border border-sand-200 text-center py-12">
            <span className="text-4xl block mb-3">🦗</span>
            <p className="text-sm font-semibold text-bark">No one here yet.</p>
            <p className="text-xs text-sand-400 mt-1">Complete all 3 challenges to claim #1.</p>
          </div>
        )}
      </div>
    </div>
  );
}
