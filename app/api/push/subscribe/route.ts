import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

/** POST — save a new push subscription for the current user */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sub = await req.json();
  const endpoint: string = sub.endpoint;
  const p256dh: string = sub.keys?.p256dh;
  const auth: string = sub.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
  }

  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${userId}, ${endpoint}, ${p256dh}, ${auth})
    ON CONFLICT (endpoint)
    DO UPDATE SET user_id = ${userId}, p256dh = ${p256dh}, auth = ${auth}`;

  return NextResponse.json({ success: true });
}

/** DELETE — remove a push subscription (user unsubscribes) */
export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { endpoint } = await req.json();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND user_id = ${userId}`;

  return NextResponse.json({ success: true });
}
