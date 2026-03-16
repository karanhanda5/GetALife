"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import StreakDisplay from "@/components/StreakDisplay";

interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  avatar_url: string | null;
  bio: string | null;
  current_streak: number;
  longest_streak: number;
  full_streak: number;
  longest_full_streak: number;
  total_points: number;
  created_at: string;
}

interface HistoryEntry {
  title: string;
  difficulty: string;
  points: number;
  completed_at: string;
  assigned_date: string;
}

const difficultyColor: Record<string, string> = {
  easy: "text-moss-500",
  medium: "text-amber-600",
  hard: "text-coral-500",
};

/** Compress to 400 px square-ish JPEG at 80 % quality (~25-50 KB) */
function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 400;
        const ratio = Math.min(SIZE / img.width, SIZE / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { signOut } = useClerk();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState<string | null>(null); // null = no change
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const d = await fetch("/api/profile").then((r) => r.json());
    setUser(d.user);
    setHistory(d.history || []);
    setLoading(false);
  }

  function startEdit() {
    if (!user) return;
    setEditName(user.name || "");
    setEditBio(user.bio || "");
    setEditAvatar(null);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditAvatar(null);
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressAvatar(file);
      setEditAvatar(compressed);
    } catch {
      alert("Couldn't process that image — please try again.");
    } finally {
      setCompressing(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      // Build payload — only include avatar_url if user actually picked a new photo
      const payload: Record<string, string | null> = {
        name: editName.trim() || user?.name || "",
        bio: editBio.trim() || null,
      };
      if (editAvatar !== null) payload.avatar_url = editAvatar;

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await loadProfile();
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-sand-400 font-medium">Loading profile…</p>
      </div>
    );
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Which avatar to display: newly-picked > saved custom > Clerk OAuth image > initials
  const displayAvatar = editAvatar ?? user.avatar_url ?? user.image ?? null;

  return (
    <div className="space-y-6">

      {/* ── Profile header ───────────────────────────────────────────────── */}
      <div className="text-center animate-fade-up pt-2">

        {/* Avatar circle */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-24 h-24 rounded-full bg-sand-100 overflow-hidden flex items-center justify-center border-2 border-sand-200 shadow-soft">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="Profile picture"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-bark select-none">
                {user.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          {/* Camera overlay in edit mode */}
          {isEditing && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={compressing}
              className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white gap-0.5 transition-opacity active:opacity-70 touch-manipulation"
            >
              {compressing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CameraIcon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Change</span>
                </>
              )}
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        {/* Name */}
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Your name"
            className="text-center w-full max-w-[240px] mx-auto block font-display text-2xl text-bark bg-transparent border-b-2 border-moss-300 focus:border-moss-500 focus:outline-none pb-1 mb-1"
          />
        ) : (
          <h1 className="font-display text-2xl text-bark">{user.name}</h1>
        )}

        {/* Bio */}
        {isEditing ? (
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Write a short bio… (max 160 chars)"
            rows={2}
            maxLength={160}
            className="mt-2 w-full max-w-[280px] mx-auto block text-center text-sm text-bark bg-sand-50 border border-sand-200 rounded-2xl px-3 py-2 focus:outline-none focus:border-moss-300 resize-none leading-snug"
          />
        ) : (
          <p className="text-sm text-sand-400 mt-1 max-w-[280px] mx-auto leading-snug min-h-[1.25rem]">
            {user.bio ?? <span className="italic opacity-50">No bio yet</span>}
          </p>
        )}

        <p className="text-xs text-sand-300 mt-1.5">Member since {memberSince}</p>

        {/* Edit / Save / Cancel */}
        <div className="mt-4 flex justify-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-2xl border border-sand-200 text-sm font-medium text-sand-400 active:scale-95 transition-all touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-2xl bg-moss-500 text-white text-sm font-semibold active:scale-95 transition-all touch-manipulation disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-sand-200 text-sm font-medium text-bark active:scale-95 transition-all touch-manipulation"
            >
              <PencilIcon className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Streak ───────────────────────────────────────────────────────── */}
      <div className="animate-fade-up delay-100">
        <StreakDisplay current={user.current_streak} longest={user.longest_streak} />
      </div>

      {/* ── Stats grid ───────────────────────────────────────────────────── */}
      <div className="animate-fade-up delay-200 grid grid-cols-3 gap-3">
        {[
          { label: "Points",      value: user.total_points.toLocaleString(), emoji: "⭐" },
          { label: "Best Streak", value: `${user.longest_streak}d`,          emoji: "🏅" },
          { label: "Completed",   value: history.length.toString(),           emoji: "✅" },
        ].map((s) => (
          <div key={s.label} className="card border border-sand-200 text-center py-4">
            <span className="text-xl block mb-1">{s.emoji}</span>
            <div className="font-display text-xl text-bark">{s.value}</div>
            <div className="text-[11px] text-sand-400 font-semibold uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Full-streak callout (if earned) ──────────────────────────────── */}
      {user.full_streak > 0 && (
        <div className="animate-fade-up card border border-amber-100 bg-amber-50 text-center py-4">
          <span className="text-2xl block mb-1">🔥</span>
          <p className="font-semibold text-amber-700">
            {user.full_streak}-day full streak!
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            {"You've completed all 3 challenges for"} {user.full_streak} day{user.full_streak !== 1 ? "s" : ""} in a row
          </p>
        </div>
      )}

      {/* ── Recent completions ───────────────────────────────────────────── */}
      <div className="animate-fade-up delay-300">
        <h2 className="text-xs font-semibold text-sand-400 uppercase tracking-wider mb-3">
          Recent Completions
        </h2>
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
                    {new Date(h.assigned_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    <span className={difficultyColor[h.difficulty]}>{h.difficulty}</span>
                  </p>
                </div>
                <span className="font-mono text-sm text-sand-400 shrink-0">+{h.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sign out ─────────────────────────────────────────────────────── */}
      <div className="animate-fade-up pt-2 pb-2">
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full text-sm text-coral-500 font-semibold py-3 rounded-2xl border border-coral-100 hover:bg-coral-50 active:scale-[0.98] transition-all touch-manipulation"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
