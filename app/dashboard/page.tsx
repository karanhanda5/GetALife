"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import ChallengeCard from "@/components/ChallengeCard";

interface Challenge {
  id: number;
  challenge_id: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  completed: boolean;
  proof_url?: string;
}

interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_points: number;
  full_streak: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDoneBanner, setAllDoneBanner] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [chalRes, profileRes] = await Promise.all([
        fetch("/api/challenges"),
        fetch("/api/profile"),
      ]);
      const chalData = await chalRes.json();
      const profileData = await profileRes.json();
      setChallenges(chalData.challenges || []);
      if (profileData.user) {
        setStats({
          current_streak: profileData.user.current_streak,
          longest_streak: profileData.user.longest_streak,
          total_points: profileData.user.total_points,
          full_streak: profileData.user.full_streak ?? 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) fetchData();
  }, [isLoaded, user, fetchData]);

  async function handleComplete(dailyChallengeId: number, proofUrl: string) {
    const res = await fetch("/api/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyChallengeId, proofUrl }),
    });
    const data = await res.json();
    if (data.success) {
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === dailyChallengeId ? { ...c, completed: true, proof_url: proofUrl } : c
        )
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              current_streak: data.currentStreak,
              longest_streak: Math.max(prev.longest_streak, data.currentStreak),
              total_points: prev.total_points + data.pointsEarned,
              full_streak: data.fullStreak ?? prev.full_streak,
            }
          : prev
      );
      if (data.bonusAwarded) {
        setAllDoneBanner(true);
        setTimeout(() => setAllDoneBanner(false), 5000);
      }
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse-glow">🌿</div>
          <p className="text-sm text-sand-400 font-medium">Loading your day…</p>
        </div>
      </div>
    );
  }

  const completedCount = challenges.filter((c) => c.completed).length;
  const todayProgress = challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0;
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning ☀️" : h < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="animate-fade-up">
        <p className="text-sm text-sand-400 font-medium">{greeting}</p>
        <h1 className="font-display text-3xl text-bark leading-tight">
          {user?.firstName || user?.fullName?.split(" ")[0] || "Challenger"}
        </h1>
      </div>

      {/* Stats row */}
      <div className="animate-fade-up delay-100 grid grid-cols-2 gap-3">
        <div className="card border border-sand-200 flex items-center gap-3 py-4">
          <span className="text-3xl animate-pulse-glow">🔥</span>
          <div>
            <div className="font-display text-2xl text-bark leading-none">{stats?.current_streak || 0}</div>
            <div className="text-[11px] text-sand-400 font-semibold uppercase tracking-wider">Streak</div>
          </div>
        </div>
        <div className="card border border-sand-200 flex items-center gap-3 py-4">
          <span className="text-3xl">⭐</span>
          <div>
            <div className="font-display text-2xl text-bark leading-none">{stats?.total_points || 0}</div>
            <div className="text-[11px] text-sand-400 font-semibold uppercase tracking-wider">Points</div>
          </div>
        </div>
      </div>

      {/* Daily progress bar */}
      <div className="animate-fade-up delay-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-sand-400 uppercase tracking-wider">
            Today&apos;s Progress
          </span>
          <span className="text-xs font-mono text-sand-400">{completedCount}/{challenges.length}</span>
        </div>
        <div className="h-2.5 bg-sand-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-moss-400 to-moss-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>

      {/* All-done banner */}
      {allDoneBanner && (
        <div className="card bg-gradient-to-r from-moss-100 to-moss-50 border border-moss-200 text-center animate-fade-up">
          <div className="text-3xl mb-1">🎉</div>
          <p className="font-display text-lg text-moss-700">All 3 complete!</p>
          <p className="text-sm text-moss-500">+30 bonus points. You&apos;re crushing it.</p>
        </div>
      )}

      {/* Challenges */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-sand-400 uppercase tracking-wider animate-fade-up delay-200">
          Today&apos;s Challenges
        </h2>
        {challenges.map((c, i) => (
          <div key={c.id} className={`animate-fade-up delay-${(i + 1) * 100}`}>
            <ChallengeCard challenge={c} onComplete={handleComplete} />
          </div>
        ))}
      </div>
    </div>
  );
}
