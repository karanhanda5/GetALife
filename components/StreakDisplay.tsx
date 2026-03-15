"use client";

export default function StreakDisplay({
  current,
  longest,
  compact = false,
}: {
  current: number;
  longest: number;
  compact?: boolean;
}) {
  const streakMessage =
    current === 0
      ? "Complete a challenge to start your streak!"
      : current === 1
      ? "Day 1. The hardest part is starting."
      : current < 7
      ? "Building momentum. Keep going."
      : current < 30
      ? "You're on a roll. Don't break the chain."
      : "Legendary. You're actually living.";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl animate-pulse-glow">🔥</span>
        <span className="font-display text-2xl text-bark">{current}</span>
        <span className="text-xs text-sand-400 font-medium">day streak</span>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-cream to-sand-100 border border-sand-200 text-center">
      <div className="text-5xl mb-2 animate-pulse-glow">🔥</div>
      <div className="font-display text-5xl text-bark mb-1">{current}</div>
      <div className="text-sm font-semibold text-sand-400 uppercase tracking-wider mb-3">
        Day Streak
      </div>
      <p className="text-sm text-bark/70 italic">{streakMessage}</p>
      {longest > 0 && (
        <div className="mt-3 pt-3 border-t border-sand-200">
          <span className="text-xs text-sand-400">
            Personal best: <strong className="text-bark">{longest} days</strong>
          </span>
        </div>
      )}
    </div>
  );
}
