// Steadfast er nijer "Fraud Check" (merchant panel) — BD Courier Steadfast er live hishab dey na, tai
// merchant er email/password diye steadfast.com.bd e login kore ei number er parcel hishab ani.
const BASE = "https://steadfast.com.bd";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

export const sfLoginReady = (s) => Boolean(String(s.sf_login_email || "").trim() && String(s.sf_login_password || ""));

// Login er cookie server e kichukkhon rekhe dei, jate proti check e notun login na lage
let session = null; // { key, cookies: Map, at }
const SESSION_MS = 60 * 60 * 1000;

function addCookies(jar, res) {
  for (const c of res.headers.getSetCookie?.() || []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    if (i > 0) jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
}
const cookieHeader = (jar) => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

async function login(email, password) {
  const jar = new Map();
  const page = await fetch(`${BASE}/login`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) });
  addCookies(jar, page);
  const token = (await page.text()).match(/name="_token"\s+value="([^"]+)"/)?.[1];
  if (!token) throw new Error("Steadfast লগইন পেজ খোলা যায়নি");

  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(jar),
      Referer: `${BASE}/login`,
    },
    body: new URLSearchParams({ _token: token, email, password }),
    signal: AbortSignal.timeout(15000),
  });
  addCookies(jar, res);
  // Thik login hole dashboard e pathay; bhul hole abar /login e
  const to = res.headers.get("location") || "";
  if (res.status >= 400 || /\/login\b/.test(to)) {
    throw new Error("Steadfast লগইন হয়নি — ইমেইল/পাসওয়ার্ড ঠিক আছে কিনা দেখুন");
  }
  return jar;
}

async function fetchCheck(jar, phone) {
  const res = await fetch(`${BASE}/user/frauds/check/${phone}`, {
    redirect: "manual",
    headers: { "User-Agent": UA, Cookie: cookieHeader(jar), Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
    signal: AbortSignal.timeout(15000),
  });
  if (res.status !== 200) return null;
  return res.json().catch(() => null);
}

/** Steadfast e ei number er parcel: { name, total, delivered, returned, frauds } — login tottho na thakle null */
export async function steadfastCheck(phone, s) {
  if (!sfLoginReady(s)) return null;
  const email = String(s.sf_login_email).trim();
  const key = `${email}:${s.sf_login_password}`;
  let fresh = false;
  if (!session || session.key !== key || Date.now() - session.at > SESSION_MS) {
    session = { key, cookies: await login(email, s.sf_login_password), at: Date.now() };
    fresh = true;
  }
  let json = await fetchCheck(session.cookies, phone);
  // Session sesh hoye gele ekbar abar login
  if (!json && !fresh) {
    session = { key, cookies: await login(email, s.sf_login_password), at: Date.now() };
    json = await fetchCheck(session.cookies, phone);
  }
  if (!json) {
    session = null;
    throw new Error("Steadfast থেকে ডাটা আনা যায়নি");
  }
  const delivered = Number(json.total_delivered) || 0;
  const returned = Number(json.total_cancelled) || 0;
  return {
    name: "SteadFast",
    total: delivered + returned,
    delivered,
    returned,
    frauds: Array.isArray(json.frauds) ? json.frauds.length : 0,
  };
}
