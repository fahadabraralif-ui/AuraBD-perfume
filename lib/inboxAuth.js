import crypto from "node:crypto";

// FB Unified Inbox theke asha request — INBOX_API_KEY header mile gele-i dhukte dei
export function inboxAuthorized(req) {
  const key = process.env.INBOX_API_KEY || "";
  const got = req.headers.get("x-inbox-key") || "";
  if (key.length < 20 || got.length !== key.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(key));
}

export const unauthorized = () => Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
