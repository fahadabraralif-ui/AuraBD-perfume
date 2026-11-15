import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sql, ensureTables } from "@/lib/db";
import { getSettings, getProducts, deliveryOptions, deliveryCharge } from "@/lib/store";
import { notifyNewOrder } from "@/lib/telegram";
import { pushNewOrder } from "@/lib/push";
import { inboxAuthorized, unauthorized } from "@/lib/inboxAuth";

export const dynamic = "force-dynamic";

// Facebook inbox theke staff je order boshay. Website er fake-order check (IP/phone limit) ekhane lage na,
// karon staff nije customer er sathe kotha bole order nicche.
export async function POST(req) {
  if (!inboxAuthorized(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone || "").trim();
  if (!body?.name || !/^01[3-9]\d{8}$/.test(phone) || !body.address) {
    return Response.json({ ok: false, error: "নাম, সঠিক ফোন নম্বর (01XXXXXXXXX) আর ঠিকানা দিন" }, { status: 400 });
  }

  try {
    await ensureTables();
    const [settings, products] = await Promise.all([getSettings(), getProducts({ all: true })]);
    const product = products.find((p) => p.id === Number(body.productId));
    const area = deliveryOptions(settings).find((d) => d.id === body.area);
    if (!product || !area) return Response.json({ ok: false, error: "পণ্য বা ডেলিভারি এলাকা পাওয়া যায়নি" }, { status: 400 });

    const qty = Math.min(10, Math.max(1, Number(body.qty) || 1));
    const total = product.price * qty + deliveryCharge(settings, area, product, qty);
    const name = String(body.name).trim().slice(0, 100);
    const address = String(body.address).trim().slice(0, 500);
    const note = String(body.note || "").trim().slice(0, 300);

    const [row] = await sql`
      INSERT INTO orders (name, phone, address, product, area, qty, total, ip, page_url, note)
      VALUES (${name}, ${phone}, ${address}, ${product.name}, ${area.id}, ${qty}, ${total}, 'fb-inbox',
              'fb-inbox', ${note})
      RETURNING id`;
    await sql`UPDATE products SET stock = GREATEST(stock - ${qty}, 0) WHERE id = ${product.id}`;
    await sql`DELETE FROM incomplete_orders WHERE phone = ${phone}`;
    revalidatePath("/admin", "layout");
    after(() => notifyNewOrder(row.id));
    after(() => pushNewOrder(row.id));

    return Response.json({ ok: true, id: Number(row.id), total, product: product.name, qty });
  } catch (err) {
    console.error("Inbox order save failed", err);
    return Response.json({ ok: false, error: "ওয়েবসাইটে অর্ডার সেভ হয়নি, আবার চেষ্টা করুন" }, { status: 500 });
  }
}
