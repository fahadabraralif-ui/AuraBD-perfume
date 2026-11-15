import Link from "next/link";
import { getSettings, getProducts } from "@/lib/store";
import { sql } from "@/lib/db";
import { COMBO_SECTIONS, getCombo } from "@/lib/combo";
import { saveComboAction } from "../../actions";
import SaveForm from "../SaveForm";
import ImageInput from "../ImageInput";
import { ComboProduct, ResetCombo } from "./ComboProduct";

// List (pondo, karon, FAQ) er item — sheshe ekta faka ghor notun item er jonno
function ListFields({ list, items }) {
  const rows = [...items, Object.fromEntries(list.fields.map(([f]) => [f, ""]))];
  return (
    <div className="content-list">
      <h4>{list.title} <small className="adm-muted">(সব ঘর খালি করলে ওই আইটেম মুছে যাবে, শেষের খালি ঘরে নতুন যোগ করুন)</small></h4>
      {rows.map((item, i) => (
        <div key={i} className={`content-item ${i === items.length ? "new" : ""}`}>
          <span className="content-num">{i === items.length ? "➕ নতুন" : `#${i + 1}`}</span>
          {list.fields.map(([f, label, kind]) => kind === "image" ? (
            <div key={f} className="content-img">
              {label}
              <ImageInput name={`l.${list.key}.${i}.${f}`} defaultValue={item[f] || ""} folder="products" />
            </div>
          ) : (
            <label key={f}>
              {label}
              {kind ? <textarea name={`l.${list.key}.${i}.${f}`} defaultValue={item[f] || ""} rows={2} />
                : <input name={`l.${list.key}.${i}.${f}`} defaultValue={item[f] || ""} />}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function ComboAdmin() {
  const [s, products] = await Promise.all([getSettings(), getProducts({ all: true })]);
  const c = getCombo(s);
  const product = products.find((p) => p.id === c.productId);
  // Ei page theke koyta order eseche
  const [stats] = product
    ? await sql`SELECT count(*)::int AS n, coalesce(sum(total), 0)::int AS t FROM orders WHERE product = ${product.name}`
    : [{ n: 0, t: 0 }];

  return (
    <>
      <div className="adm-title-row">
        <h1 className="adm-title">কম্বো ক্যাম্পেইন পেজ</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/combo1490" target="_blank" rel="noreferrer" className="adm-btn ghost">👁 পেজ দেখুন</a>
          <ResetCombo />
        </div>
      </div>

      <div className="adm-box content-help">
        <b>✍️ কীভাবে কাজ করে</b>
        <ul className="fraud-always">
          <li>পেজের লিংক: <a href="/combo1490" target="_blank" rel="noreferrer"><code>{s.domain ? `${s.domain}/combo1490` : "/combo1490"}</code></a> — প্রতিটি বক্সের <b>সেভ করুন</b> চাপলেই সাইটে বদলে যাবে।</li>
          <li>এই পেজের অর্ডার সাধারণ অর্ডারের মতোই <Link href="/admin/orders">অর্ডার</Link> পেজে আসবে — কুরিয়ার, Telegram, Pixel সব একইভাবে কাজ করবে।</li>
          <li>লেখায় <code>{"{price}"}</code> লিখলে দাম বসবে, আরও আছে: <code>{"{old_price}"}</code> <code>{"{brand}"}</code> <code>{"{inside}"}</code> <code>{"{outside}"}</code> (ডেলিভারি চার্জ)</li>
          <li>হেডিংয়ে <code>[ ]</code> এর ভেতরের লেখা সোনালি হয়।</li>
          {product && <li>এই পণ্যে এখন পর্যন্ত অর্ডার: <b>{stats.n}টি</b> • মোট ৳{stats.t.toLocaleString("en-IN")}</li>}
        </ul>
      </div>

      <details className="adm-box content-sec" open>
        <summary><h3>🛒 পণ্য, দাম ও পেজ চালু/বন্ধ</h3></summary>
        <SaveForm action={saveComboAction}>
          <ComboProduct products={products} selectedId={c.productId} enabled={c.enabled} />
        </SaveForm>
      </details>

      {COMBO_SECTIONS.map((sec) => (
        <details key={sec.id} className="adm-box content-sec">
          <summary><h3>{sec.title}</h3></summary>
          <SaveForm action={saveComboAction}>
            <div className="content-grid">
              {sec.fields.map(([k, label, kind]) => kind === "image" ? (
                <div key={k} className="content-img wide">
                  {label}
                  <ImageInput name={`t.${k}`} defaultValue={c.text[k] || ""} folder="banners" />
                </div>
              ) : (
                <label key={k} className={kind ? "wide" : ""}>
                  {label}
                  {kind ? <textarea name={`t.${k}`} defaultValue={c.text[k]} rows={3} /> : <input name={`t.${k}`} defaultValue={c.text[k]} />}
                </label>
              ))}
            </div>
            {sec.list && <ListFields list={sec.list} items={c.lists[sec.list.key]} />}
          </SaveForm>
        </details>
      ))}
    </>
  );
}
