import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sql, ensureTables } from "@/lib/db";
import { getSettings, getProducts, deliveryOptions, deliveryCharge } from "@/lib/store";
import { checkOrder, clientIp } from "@/lib/fraud";
import { notifyNewOrder } from "@/lib/telegram";
import { pushNewOrder } from "@/lib/push";
import { sendPurchase } from "@/lib/fbcapi";
import { getCombo } from "@/lib/combo";
import { isAdmin } from "@/lib/auth";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !/^01[3-9]\d{8}$/.test(body.phone || "") || !body.address) {
    return Response.json({ ok: false, error: "সব তথ্য সঠিকভাবে দিন" }, { status: 400 });
  }

  try {
    await ensureTables();
    const [settings, allProducts] = await Promise.all([getSettings(), getProducts({ all: true })]);
    // Main site e shudhu সক্রিয় pondo; /combo1490 page er pondo (main site e lukano thakleo) order neya jay
    const comboId = getCombo(settings).productId;
    const products = allProducts.filter((p) => p.active || p.id === comboId);
    const ip = clientIp(req);

    const problem = await checkOrder({
      phone: body.phone, ip, name: body.name, address: body.address, honeypot: body.website, settings,
    });
    if (problem?.silent) return Response.json({ ok: true, id: 0 });
    if (problem) return Response.json({ ok: false, error: problem.error }, { status: problem.status });

    const product = products.find((p) => p.id === Number(body.productId));
    const area = deliveryOptions(settings).find((d) => d.id === body.area);
    if (!product || !area) {
      return Response.json({ ok: false, error: "পণ্য পাওয়া যায়নি, পেজ রিফ্রেশ করুন" }, { status: 400 });
    }

    // Dam server e hishab hoy, browser theke asha total bishshash kora hoy na
    const qty = Math.min(10, Math.max(1, Number(body.qty) || 1));
    const total = product.price * qty + deliveryCharge(settings, area, product, qty);
    const name = String(body.name).trim().slice(0, 100);
    // Admin login kora browser theke order (test) — Facebook e Purchase jabe na, pore status bodlaleo na
    const admin = await isAdmin();
    // Facebook Conversions API er jonno (order ashar sathe Purchase e lage)
    const fbp = admin ? "" : String(body.fbp || "").slice(0, 200);
    const fbc = admin ? "" : String(body.fbc || "").slice(0, 300);
    const userAgent = admin ? "" : String(req.headers.get("user-agent") || "").slice(0, 400);
    const pageUrl = String(body.pageUrl || "").slice(0, 400);
    const address = String(body.address).trim().slice(0, 500);

    const [row] = await sql`
      INSERT INTO orders (name, phone, address, product, area, qty, total, ip, fbp, fbc, user_agent, page_url, note)
      VALUES (${name}, ${body.phone}, ${address}, ${product.name}, ${area.id}, ${qty}, ${total}, ${ip},
              ${fbp}, ${fbc}, ${userAgent}, ${pageUrl}, ${admin ? "🧪 অ্যাডমিন ব্রাউজার থেকে — Pixel এ যায়নি" : ""})
      RETURNING id`;
    await sql`UPDATE products SET stock = GREATEST(stock - ${qty}, 0) WHERE id = ${product.id}`;
    await sql`DELETE FROM incomplete_orders WHERE phone = ${body.phone}`;
    revalidatePath("/admin", "layout");
    // Customer ke wait na koriye Telegram e pathay
    after(() => notifyNewOrder(row.id));
    // Android admin app e notification
    after(() => pushNewOrder(row.id));
    // Order ashar sathe sathe Purchase (Conversions API) — browser er Purchase er sathe ek event_id, tai ekbar-i gona hoy
    if (!admin) after(() => sendPurchase(row.id));

    return Response.json({ ok: true, id: Number(row.id), track: !admin });
  } catch (err) {
    console.error("Order save failed", err);
    return Response.json({ ok: false, error: "সার্ভারে সমস্যা, একটু পরে আবার চেষ্টা করুন" }, { status: 500 });
  }
}
