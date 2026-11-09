import Link from "next/link";
import { sql, ensureTables } from "@/lib/db";
import { getSettings } from "@/lib/store";
import { cachedHistory, checkPhoneSafe, bdcKey } from "@/lib/bdcourier";
import IncompleteList from "./IncompleteList";

// Ek bar page khulle shorboccho koyta notun number BD Courier e check hobe (page dhire na hoy)
const MAX_AUTO_CHECK = 25;

export default async function IncompletePage() {
  await ensureTables();
  const [rows, settings] = await Promise.all([
    sql`SELECT * FROM incomplete_orders ORDER BY updated_at DESC LIMIT 1000`,
    getSettings(),
  ]);

  // BD Courier: shob courier e ei number er ager parcel er hishab (cache, na thakle ekhoni ani)
  const hasKey = !!bdcKey(settings);
  const courierHist = await cachedHistory(rows.map((r) => r.phone));
  if (hasKey) {
    const missing = [...new Set(rows.map((r) => r.phone))].filter((p) => !courierHist[p]).slice(0, MAX_AUTO_CHECK);
    const fresh = await Promise.all(missing.map((p) => checkPhoneSafe(p)));
    missing.forEach((p, i) => fresh[i] && (courierHist[p] = fresh[i]));
  }

  return (
    <>
      <h1 className="adm-title">অসম্পূর্ণ অর্ডার</h1>
      <p className="adm-muted adm-intro">
        যারা ফর্মে মোবাইল নাম্বার লিখেছে কিন্তু অর্ডার কনফার্ম করেনি — এদের কল করলে অনেক অর্ডার ফেরত আসে।
        অর্ডার করে ফেললে এখান থেকে নিজে থেকেই মুছে যায়।
      </p>
      {!hasKey && (
        <p className="adm-muted adm-intro">
          ⚠️ কুরিয়ার রিসিভ/রিটার্ন % দেখতে <Link href="/admin/fraud">ফেক অর্ডার পেজে</Link> BD Courier API key দিন।
        </p>
      )}
      <IncompleteList
        rows={rows.map((r) => ({
          ...r,
          updated_at: new Date(r.updated_at).toISOString(),
          courierHist: courierHist[r.phone] || null,
        }))}
      />
    </>
  );
}
