import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import webpush from "web-push";

// Must run in Node.js (web-push uses Node crypto)
export const runtime = "nodejs";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(req: NextRequest) {
  // Vercel automatically sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all active push subscriptions
  const { rows: subs } = await sql`
    SELECT endpoint, p256dh, auth FROM push_subscriptions`;

  if (subs.length === 0) {
    return NextResponse.json({ message: "No subscribers", sent: 0 });
  }

  const payload = JSON.stringify({
    title: "🌿 GetALife — New Challenges Ready!",
    body: "Your 3 daily real-life challenges are waiting. Time to get a life! 💪",
    url: "/dashboard",
    icon: "/logo.png",
  });

  // Send to all subscribers in parallel
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  // Clean up expired/gone subscriptions (HTTP 410 = browser unsubscribed)
  const toDelete = results
    .map((r, i) => ({ r, sub: subs[i] }))
    .filter(
      ({ r }) =>
        r.status === "rejected" &&
        (r as PromiseRejectedResult).reason?.statusCode === 410
    );

  for (const { sub } of toDelete) {
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
  }

  console.log(`Push cron: sent=${sent}, failed=${failed}, cleaned=${toDelete.length}`);
  return NextResponse.json({ sent, failed, total: subs.length, cleaned: toDelete.length });
}
