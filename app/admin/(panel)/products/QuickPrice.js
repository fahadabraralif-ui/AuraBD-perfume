"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { quickUpdateProduct } from "../../actions";

// Table er bhetor thekei dam / ager dam / stock bodlano — bodlale "সেভ" button ashe
export default function QuickPrice({ p }) {
  const router = useRouter();
  const [base, setBase] = useState({ price: String(p.price), oldPrice: String(p.old_price || 0), stock: String(p.stock) });
  const [v, setV] = useState(base);
  const [msg, setMsg] = useState(null);
  const [pending, startTransition] = useTransition();
  const changed = v.price !== base.price || v.oldPrice !== base.oldPrice || v.stock !== base.stock;
  const set = (k) => (e) => { setV({ ...v, [k]: e.target.value }); setMsg(null); };

  function save() {
    startTransition(async () => {
      const res = await quickUpdateProduct(p.id, v);
      if (res?.ok) {
        setBase(v);
        setMsg({ ok: true, text: "✓ সেভ হয়েছে" });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res?.error || "সেভ হয়নি" });
      }
    });
  }

  const onKey = (e) => { if (e.key === "Enter" && changed) save(); };
  const box = { width: 90, padding: "6px 8px" };
  return (
    <>
      <td><input type="number" min="1" value={v.price} onChange={set("price")} onKeyDown={onKey} style={box} aria-label="দাম" /></td>
      <td><input type="number" min="0" value={v.oldPrice} onChange={set("oldPrice")} onKeyDown={onKey} style={box} aria-label="আগের দাম" /></td>
      <td>
        <input type="number" min="0" value={v.stock} onChange={set("stock")} onKeyDown={onKey} style={{ ...box, width: 70 }} aria-label="স্টক" />
        {(changed || msg) && (
          <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {changed && <button type="button" className="adm-btn sm" disabled={pending} onClick={save}>{pending ? "..." : "💾 সেভ"}</button>}
            {msg && <small className={msg.ok ? "adm-ok" : "adm-err"}>{msg.text}</small>}
          </div>
        )}
      </td>
    </>
  );
}
