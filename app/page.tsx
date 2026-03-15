import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4">
      <div className="animate-fade-up">
        <span className="text-6xl mb-4 block">🌿</span>
        <h1 className="font-display text-5xl sm:text-6xl text-bark leading-[1.1] mb-4">
          Get a Life<span className="text-moss-400">.</span>
        </h1>
        <p className="text-lg text-sand-400 max-w-sm mx-auto leading-relaxed mb-2">
          3 daily challenges to get you off your phone and into the real world.
        </p>
        <p className="text-sm text-sand-300 mb-8">
          Maintain your streak. Earn points. Actually live.
        </p>
      </div>

      <div className="animate-fade-up delay-200 flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/login"
          className="bg-bark text-cream rounded-2xl px-6 py-4 text-center font-semibold text-lg hover:bg-night-800 active:scale-[0.97] transition-all duration-150 shadow-card"
        >
          Start Today
        </Link>
        <Link href="/leaderboard" className="text-sm text-sand-400 hover:text-bark transition-colors font-medium">
          View leaderboard →
        </Link>
      </div>

      <div className="animate-fade-up delay-300 mt-16 grid gap-4 w-full max-w-sm">
        {[
          { emoji: "🎲", text: "Get 3 random real-life challenges each day" },
          { emoji: "✅", text: "Complete at least 1 to keep your streak alive" },
          { emoji: "🏆", text: "Earn points, climb the leaderboard, feel alive" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-4 text-left card border border-sand-200 py-4">
            <span className="text-2xl shrink-0">{step.emoji}</span>
            <p className="text-sm text-bark/80 leading-snug">{step.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 text-xs text-sand-300">
        Built for people who forgot what grass looks like.
      </p>
    </div>
  );
}
