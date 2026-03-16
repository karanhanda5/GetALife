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
          className="bg-bark text-cream rounded-2xl px-6 py-4 text-center font-semibold text-lg active:scale-[0.97] transition-all duration-150 shadow-card touch-manipulation"
        >
          Start Today
        </Link>
        <Link href="/leaderboard" className="text-sm text-sand-400 font-medium py-2 text-center touch-manipulation">
          View leaderboard →
        </Link>
      </div>

      <div className="animate-fade-up delay-300 mt-12 grid gap-3 w-full max-w-sm">
        {[
          { emoji: "📸", text: "Prove it with a photo — no cheating allowed" },
          { emoji: "🎲", text: "Fresh challenges every day, never the same week" },
          { emoji: "🏆", text: "Complete all 3 daily to top the leaderboard" },
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
