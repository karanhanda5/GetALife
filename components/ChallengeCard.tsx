"use client";

import { useState, useRef } from "react";

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

const difficultyEmoji: Record<string, string> = { easy: "🌱", medium: "🌿", hard: "🌲" };
const categoryEmoji: Record<string, string> = {
  mind: "🧠", health: "💪", social: "💬", outdoors: "🌤️", detox: "📵", environment: "🏡",
};

/** Compress an image file to JPEG, max 800px, quality 0.75 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ChallengeCard({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: (id: number, proofUrl: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofData, setProofData] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const done = challenge.completed;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setProofPreview(compressed);
      setProofData(compressed);
    } catch {
      alert("Couldn't process that image. Please try again.");
    } finally {
      setCompressing(false);
      // Reset input so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleConfirm() {
    if (!proofData || loading) return;
    setLoading(true);
    try {
      await onComplete(challenge.id, proofData);
    } finally {
      setLoading(false);
    }
  }

  function handleRetake() {
    setProofPreview(null);
    setProofData(null);
    setTimeout(() => fileRef.current?.click(), 50);
  }

  return (
    <div className={`card relative overflow-hidden transition-all duration-300 ${
      done ? "bg-moss-50 border border-moss-200" : "border border-sand-200"
    }`}>
      {/* Header row */}
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

      {/* Title */}
      <h3 className={`font-display text-xl mb-1.5 leading-tight ${
        done ? "line-through text-moss-500 opacity-70" : "text-bark"
      }`}>
        {challenge.title}
      </h3>

      {/* Description */}
      {challenge.description && (
        <p className="text-sm text-sand-400 mb-4 leading-relaxed">{challenge.description}</p>
      )}

      {/* Completed proof photo */}
      {done && challenge.proof_url && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-moss-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={challenge.proof_url}
            alt="Proof photo"
            className="w-full h-36 object-cover"
          />
        </div>
      )}

      {/* Camera capture UI */}
      {!done && showCamera && (
        <div className="mb-4 rounded-2xl border border-sand-200 bg-sand-50 overflow-hidden">
          {compressing ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-6 h-6 border-2 border-bark border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-sand-400">Processing photo…</p>
            </div>
          ) : !proofPreview ? (
            /* No photo yet — show capture prompt */
            <div className="flex flex-col items-center text-center p-5 gap-3">
              <span className="text-4xl">📸</span>
              <div>
                <p className="text-sm font-semibold text-bark">Prove it!</p>
                <p className="text-xs text-sand-400 mt-0.5">
                  Snap or upload a photo to verify you completed this challenge
                </p>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 bg-bark text-cream px-5 py-3 rounded-2xl text-sm font-semibold active:scale-[0.97] transition-all touch-manipulation w-full justify-center"
              >
                <CameraIcon className="w-4 h-4" /> Take / Upload Photo
              </button>
            </div>
          ) : (
            /* Photo selected — show preview + confirm */
            <div className="p-3">
              <div className="rounded-xl overflow-hidden mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofPreview} alt="Preview" className="w-full h-44 object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 border border-sand-200 text-sand-400 px-3 py-3 rounded-2xl text-sm font-medium active:scale-[0.97] transition-all touch-manipulation"
                >
                  Retake
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 bg-moss-500 text-white px-3 py-3 rounded-2xl text-sm font-semibold active:scale-[0.97] transition-all touch-manipulation disabled:opacity-50"
                >
                  {loading ? "Saving…" : "✓ Done!"}
                </button>
              </div>
            </div>
          )}
          {/* Hidden file input — capture="environment" opens rear camera on mobile */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            {...{ capture: "environment" }}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-sand-400">+{challenge.points} pts</span>
        {done ? (
          <span className="flex items-center gap-1.5 text-moss-500 font-semibold text-sm">
            <CheckCircleIcon className="w-5 h-5" />
            Done!
          </span>
        ) : !showCamera ? (
          <button
            onClick={() => setShowCamera(true)}
            className="bg-bark text-cream px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-night-800 active:scale-[0.97] transition-all duration-150 touch-manipulation"
          >
            Complete →
          </button>
        ) : null}
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

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
