import { sql, ensureTables } from "./db";
import { getSettings } from "./store";
import { steadfastCheck, sfCheckReady } from "./steadfastFraud";

// BD Courier (bdcourier.com): ek number er shob courier (Pathao, Steadfast, Redx...) e ager parcel er hishab
const API = "https://api.bdcourier.com/courier-check";
// Ek number ekbar check korle 12 ghonta porjonto abar API call kori na (API limit bachay)
const FRESH_MS = 12 * 60 * 60 * 1000;

export const bdcKey = (s) => String(s.bdc_api_key || process.env.BDCOURIER_API_KEY || "").trim();

/** API er uttor theke shudhu dorkari hishab: mot, delivered, return, % */
function summarize(json = null) {
  const d = json?.data || {};
  const couriers = Object.entries(d)
    .filter(([k, c]) => k !== "summary" && c && Number(c.total_parcel) > 0)
    .map(([, c]) => ({
      name: c.name,
      total: Number(c.total_parcel) || 0,
      delivered: Number(c.success_parcel) || 0,
      returned: Number(c.cancelled_parcel) || 0,
    }));
  const delivered = Number(d.summary?.success_parcel) || 0;
  const returned = Number(d.summary?.cancelled_parcel) || 0;
  const done = delivered + returned;
  return {
    total: Number(d.summary?.total_parcel) || done,
    delivered,
    returned,
    // Received % = delivered / (delivered + return) — API er success_ratio kokhono 100 er beshi dey, tai nije hishab
    rate: done ? Math.round((delivered / done) * 100) : null,
    reports: Array.isArray(json?.reports) ? json.reports.length : 0,
    // Report er details (kon merchant ki likheche) — beshi hole prothom 20 ta
    report_list: (Array.isArray(json?.reports) ? json.reports : []).slice(0, 20).map((r) => ({
      courier: String(r.courierName || r.courier || ""),
      name: String(r.name || ""),
      details: String(r.details || r.comment || ""),
      at: r.created_at || null,
    })),
    couriers,
  };
}

async function bdcFetch(key, phone) {
  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ phone }),
    signal: AbortSignal.timeout(10000),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message || json?.error || `BD Courier সমস্যা (${res.status})`);
  }
  return summarize(json);
}

/** BD Courier er purono (cache) Steadfast hishab bad diye Steadfast er live hishab boshai, mot abar hishab kori */
function mergeSteadfast(bdc, sf) {
  if (!sf) return bdc;
  if (sf.error) return { ...bdc, sf_error: sf.error };
  const others = bdc.couriers.filter((c) => !/steadfast/i.test(c.name));
  const couriers = sf.total > 0 ? [...others, { name: sf.name, total: sf.total, delivered: sf.delivered, returned: sf.returned }] : others;
  const delivered = couriers.reduce((a, c) => a + c.delivered, 0);
  const returned = couriers.reduce((a, c) => a + c.returned, 0);
  const done = delivered + returned;
  return {
    ...bdc,
    total: couriers.reduce((a, c) => a + c.total, 0),
    delivered,
    returned,
    rate: done ? Math.round((delivered / done) * 100) : null,
    reports: bdc.reports + sf.frauds,
    // Steadfast shudhu reporter er category dey (details na)
    report_list: [
      ...(bdc.report_list || []),
      ...sf.categories.map((c) => ({ courier: "SteadFast", name: "", details: c, at: null })),
    ],
    couriers,
    sf_live: true,
  };
}

/** Cache theke (ba dorkar hole API theke) ek number er courier hishab. Key na thakle null. */
export async function checkPhone(phone, { force = false } = {}) {
  if (!/^01[3-9]\d{8}$/.test(phone || "")) return null;
  await ensureTables();
  const s = await getSettings();
  if (!force) {
    const [c] = await sql`SELECT data, checked_at FROM phone_history WHERE phone = ${phone}`;
    const d = c && JSON.parse(c.data);
    // Steadfast API chalu thakle Steadfast chara purono hishab / error howa hishab abar ani
    const usable = d && !d.sf_error && Array.isArray(d.report_list) && (d.sf_live || !sfCheckReady(s));
    if (usable && Date.now() - new Date(c.checked_at).getTime() < FRESH_MS) return d;
  }
  const key = bdcKey(s);
  if (!key && !sfCheckReady(s)) return null;

  // BD Courier ar Steadfast (nijer API) eksathe
  const [bdc, sf] = await Promise.all([
    key ? bdcFetch(key, phone) : summarize(null),
    steadfastCheck(phone, s).catch((err) => ({ error: err.message })),
  ]);
  const data = { ...mergeSteadfast(bdc, sf), checked_at: new Date().toISOString() };
  await sql`
    INSERT INTO phone_history (phone, data, checked_at) VALUES (${phone}, ${JSON.stringify(data)}, now())
    ON CONFLICT (phone) DO UPDATE SET data = EXCLUDED.data, checked_at = now()`;
  return data;
}

/** Notun order e: error hole order atke na, shudhu log */
export async function checkPhoneSafe(phone) {
  try {
    return await checkPhone(phone);
  } catch (err) {
    console.error("BD Courier check failed", phone, err.message);
    return null;
  }
}

/** Onek number er cache kora hishab (API call chara) — { phone: data } */
export async function cachedHistory(phones) {
  const list = [...new Set(phones)].filter(Boolean);
  if (!list.length) return {};
  await ensureTables();
  const rows = await sql`SELECT phone, data FROM phone_history WHERE phone = ANY(${list})`;
  return Object.fromEntries(rows.map((r) => [r.phone, JSON.parse(r.data)]));
}

/** Telegram/admin e dekhanor ek line */
export function historyText(h) {
  if (!h) return null;
  if (!h.total) return "🆕 কুরিয়ার হিস্টরি: আগে কোনো পার্সেল নেই";
  const rate = h.rate ?? 0;
  const icon = rate >= 80 ? "🟢" : rate >= 50 ? "🟡" : "🔴";
  return `${icon} <b>রিসিভ ${rate}% • রিটার্ন ${100 - rate}%</b> (${h.delivered}/${h.total} পার্সেল)${h.reports ? `\n⚠️ ${h.reports}টি ফ্রড রিপোর্ট আছে` : ""}`;
}
