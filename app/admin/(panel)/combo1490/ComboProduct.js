"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetComboAction } from "../../actions";

// Kon pondo theke order hobe + dam/stock — pondo bodlale ghor gulo oi pondor tothya diye bhore
export function ComboProduct({ products, selectedId, enabled }) {
  const pick = (id) => products.find((p) => p.id === Number(id));
  const first = pick(selectedId) ? selectedId : "new";
  const [id, setId] = useState(String(first));
  const p = pick(id) || { name: "১১:১১ কম্বো অফার (৫টি পারফিউম)", price: 1490, old_price: 0, stock: 100 };

  return (
    <>
      <input type="hidden" name="p._" value="1" />
      <label className="adm-check">
        <input type="checkbox" name="p.enabled" defaultChecked={enabled} /> পেজ চালু (বন্ধ করলে /combo1490 খুললে পেজ পাওয়া যাবে না)
      </label>
      <label>
        কোন পণ্য হিসেবে অর্ডার আসবে
        <select name="p.product" value={id} onChange={(e) => setId(e.target.value)}>
          <option value="new">➕ নতুন পণ্য বানান (মেইন সাইটে দেখাবে না)</option>
          {products.map((x) => (
            <option key={x.id} value={x.id}>{x.name} — ৳{x.price}{x.active ? "" : " (মেইন সাইটে লুকানো)"}</option>
          ))}
        </select>
      </label>
      <div key={id}>
        <label>
          পণ্যের নাম (অর্ডার লিস্ট, কুরিয়ার আর Telegram এ এই নাম যাবে)
          <input name="p.name" defaultValue={p.name} />
        </label>
        <div className="adm-row">
          <label>দাম (৳) *<input name="p.price" type="number" min="1" defaultValue={p.price} required /></label>
          <label>আগের দাম (কাটা দাম, ০ = দেখাবে না)<input name="p.old_price" type="number" min="0" defaultValue={p.old_price || 0} /></label>
          <label>স্টক<input name="p.stock" type="number" min="0" defaultValue={p.stock} /></label>
        </div>
      </div>
    </>
  );
}

export function ResetCombo() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="adm-btn ghost"
      disabled={pending}
      onClick={() =>
        confirm("পেজের সব লেখা আর ছবি আগের (ডিফল্ট) অবস্থায় ফেরত যাবে। পণ্য ও দাম বদলাবে না। নিশ্চিত?") &&
        startTransition(async () => { await resetComboAction(); router.refresh(); })
      }
    >
      ↺ সব লেখা আগের মতো করুন
    </button>
  );
}
