import { isAdmin } from "@/lib/auth";
import { sql, ensureTables, orderCode } from "@/lib/db";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

// Android admin app proti 10 minit e eta dekhe — 24 ghontar bhetor er pending order (purono gulo bad)
export async function GET() {
  if (!(await isAdmin())) return Response.json({ ok: false }, { status: 401 });
  await ensureTables();
  const [s, rows] = await Promise.all([
    getSettings(),
    sql`SELECT id, name, phone, product, total,
               floor(extract(epoch FROM now() - created_at) / 60)::int AS minutes
        FROM orders
        WHERE status = 'pending' AND created_at > now() - interval '24 hours'
        ORDER BY created_at`,
  ]);
  return Response.json({
    ok: true,
    orders: rows.map((o) => ({
      id: Number(o.id), code: orderCode(o.id, s.brand), name: o.name, phone: o.phone,
      product: o.product, total: o.total, minutes: o.minutes,
    })),
  });
}
