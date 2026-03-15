import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <span className="text-4xl block mb-3">🌿</span>
        <h1 className="font-display text-3xl text-bark">Get a Life.</h1>
        <p className="text-sm text-sand-400 mt-1">
          3 challenges a day. That&apos;s all it takes.
        </p>
      </div>
      <SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
