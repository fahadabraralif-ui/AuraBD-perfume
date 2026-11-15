import { createSign } from "crypto";
import { sql, ensureTables, orderCode } from "./db";
import { getSettings } from "./store";

// Admin Android app e notification — Firebase Cloud Messaging (FCM HTTP v1).
// FIREBASE_SERVICE_ACCOUNT = Firebase > Project settings > Service accounts theke ana JSON (puro lekha).

function account() {
  try {
    const a = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "");
    return a.client_email && a.private_key && a.project_id ? a : null;
  } catch {
    return null;
  }
}
export const pushEnabled = () => Boolean(account());

let tableReady;
function ensurePushTable() {
  tableReady ??= (async () => {
    await ensureTables();
    await sql`
      CREATE TABLE IF NOT EXISTS push_devices (
        token       TEXT PRIMARY KEY,
        device      TEXT NOT NULL DEFAULT '',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_seen   TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
  })().catch((err) => {
    tableReady = undefined;
    throw err;
  });
  return tableReady;
}

export async function addDevice(token, device = "") {
  const t = String(token || "");
  if (t.length < 20 || t.length > 4096 || /\s/.test(t)) throw new Error("bad token");
  await ensurePushTable();
  await sql`
    INSERT INTO push_devices (token, device) VALUES (${t}, ${String(device).slice(0, 200)})
    ON CONFLICT (token) DO UPDATE SET device = EXCLUDED.device, last_seen = now()`;
}

export async function removeDevice(token) {
  await ensurePushTable();
  await sql`DELETE FROM push_devices WHERE token = ${String(token)}`;
}

export async function listDevices() {
  await ensurePushTable();
  return sql`SELECT token, device, created_at, last_seen FROM push_devices ORDER BY last_seen DESC`;
}

// Google OAuth access token (1 ghonta thake) — memory te rakhi
let cached = { token: "", exp: 0 };
async function accessToken(a) {
  if (cached.token && Date.now() < cached.exp - 60_000) return cached.token;
  const b64 = (x) => Buffer.from(typeof x === "string" ? x : JSON.stringify(x)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: a.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(a.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Firebase auth failed: " + JSON.stringify(data));
  cached = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

/** Shob connected phone e notification. { title, body, url, tag, type: order | incomplete | info } — koyta phone e gelo ferot dey */
export async function pushAll({ title, body, url = "/admin", tag = "", type = "info" }) {
  const a = account();
  if (!a) return 0;
  try {
    await ensurePushTable();
    const devices = await sql`SELECT token FROM push_devices`;
    if (!devices.length) return 0;
    const auth = await accessToken(a);
    let sent = 0;
    await Promise.all(
      devices.map(async ({ token }) => {
        const res = await fetch(`https://fcm.googleapis.com/v1/projects/${a.project_id}/messages:send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${auth}`, "Content-Type": "application/json" },
          // Shudhu data — app nije jore sound + vibration diye notification dekhay (app bondho thakleo)
          body: JSON.stringify({
            message: {
              token,
              data: { title, body, url, tag, type },
              android: { priority: "HIGH", ttl: "86400s" },
            },
          }),
        });
        if (res.ok) return sent++;
        const err = await res.json().catch(() => ({}));
        const code = err?.error?.details?.find((d) => d.errorCode)?.errorCode || err?.error?.status;
        // App uninstall / token batil — list theke muche feli
        if (res.status === 404 || code === "UNREGISTERED") await removeDevice(token);
        else console.error("FCM send failed", res.status, JSON.stringify(err));
      }),
    );
    return sent;
  } catch (err) {
    console.error("Push error", err);
    return 0;
  }
}

const money = (n) => `৳${Number(n).toLocaleString("en-IN")}`;

export async function pushNewOrder(orderId) {
  if (!pushEnabled()) return;
  const [o] = await sql`SELECT id, name, phone, product, qty, total FROM orders WHERE id = ${orderId}`;
  if (!o) return;
  const s = await getSettings();
  await pushAll({
    title: `🛒 নতুন অর্ডার ${orderCode(o.id, s.brand)} — ${money(o.total)}`,
    body: `${o.name} • ${o.phone} • ${o.product} × ${o.qty}`,
    url: "/admin/orders",
    tag: `order-${o.id}`,
    type: "order",
  });
}

export async function pushIncomplete(draft) {
  if (!pushEnabled()) return;
  const s = await getSettings();
  if (s.push_notify_incomplete !== "on") return;
  await pushAll({
    title: "⏳ অসম্পূর্ণ অর্ডার",
    body: [draft.name, draft.phone, draft.product].filter(Boolean).join(" • "),
    url: "/admin/incomplete",
    tag: `incomplete-${draft.phone}`,
    type: "incomplete",
  });
}
