"use client";

import { useState } from "react";

interface Challenge {
  id: number;
  challenge_id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  completed: boolean;
}

const difficultyEmoji: Record<string, string> = { easy: "🌱", medium: "🌿", hard: "🌲" };
const categoryEmoji: Record<string, string> = {
  mind: "🧠", health: "💪", social: "💬", outdoors: "🌤️", detox: "📵", environment: "🏡",
};

export default function ChallengeCard({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: (id: number) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const done = challenge.completed || justCompleted;

  async function handleComplete() {
    if (done || loading) return;
    setLoading(true);
    try {
      await onComplete(challenge.id);
      setJustCompleted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`card relative overflow-hidden transition-all duration-300 ${
        done ? "bg-moss-50 border border-moss-200" : "border border-sand-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`badge-${challenge.difficulty}`}>
          {difficultyEmoji[challenge.difficulty]} {challenge.difficulty}
        </span>
        <span className="text-sm">
          {categoryEmoji[challenge.category] || "✨"}{" "}
          <span className="text-sand-400 text-xs uppercase tracking-wider font-medium">
            {challenge.category}
          </span>
        </span>
      </div>

      <h3 className={`font-display text-xl mb-1.5 leading-tight ${done ? "line-through text-moss-500 opacity-70" : "text-bark"}`}>
        {challenge.title}
      </h3>

      {challenge.description && (
        <p className="text-sm text-sand-400 mb-4 leading-relaxed">{challenge.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-sand-400">+{challenge.points} pts</span>
        {done ? (
          <span className="flex items-center gap-1.5 text-moss-500 font-semibold text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Done!
          </span>
        ) : (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="bg-bark text-cream px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-night-800 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Complete"}
          </button>
        )}
      </div>
    </div>
  );
}
