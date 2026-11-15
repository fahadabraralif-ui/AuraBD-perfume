"use client";

import { useRef, useState } from "react";
import { bn } from "@/data/site";

function fbIds() {
  const cookie = (k) => document.cookie.split("; ").find((c) => c.startsWith(k + "="))?.split("=")[1] || "";
  const fbclid = new URLSearchParams(location.search).get("fbclid");
  return { fbp: cookie("_fbp"), fbc: cookie("_fbc") || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : ""), pageUrl: location.href.split("#")[0] };
}

// /combo1490 er order form — main site er motoi /api/order e jay, tai order admin e ashe
export default function ComboOrderForm({ product, delivery, freeBoxes = 0, text }) {
  const [qty, setQty] = useState(1);
  const [area, setArea] = useState(delivery[0].id);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const savedDraft = useRef("");
  const started = useRef(false);

  const boxes = (Number(product.boxes) || 1) * qty;
  const freeShip = freeBoxes > 0 && boxes >= freeBoxes;
  const charge = freeShip ? 0 : delivery.find((d) => d.id === area).charge;
  const subtotal = product.price * qty;
  const total = subtotal + charge;

  function onStart() {
    if (started.current) return;
    started.current = true;
    window.fbq?.("track", "InitiateCheckout", { value: total, currency: "BDT", num_items: qty });
    window.dataLayer?.push({ event: "begin_checkout", value: total, currency: "BDT" });
  }

  // Number likhe order na korle "অসম্পূর্ণ অর্ডার" e jay
  function saveDraft() {
    const f = new FormData(formRef.current);
    const phone = String(f.get("phone") || "").trim();
    if (!/^01[3-9]\d{8}$/.test(phone)) return;
    const key = JSON.stringify({ phone, website: f.get("website"), name: f.get("name"), address: f.get("address"), product: product.name });
    if (key === savedDraft.current) return;
    savedDraft.current = key;
    fetch("/api/incomplete", { method: "POST", headers: { "Content-Type": "application/json" }, body: key }).catch(() => {});
  }

  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("phone")).trim();
    if (!/^01[3-9]\d{8}$/.test(phone)) return setError("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন");
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: f.get("website"), ...fbIds(), name: f.get("name"), phone, address: f.get("address"),
          productId: product.id, area, qty, landing: "combo1490",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error);
      if (data.id) {
        window.fbq?.("track", "Purchase", { value: total, currency: "BDT", content_ids: [String(product.id)], content_type: "product", num_items: qty }, { eventID: `purchase-${data.id}` });
      }
      window.dataLayer?.push({ event: "order_placed", value: total, currency: "BDT" });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "অর্ডার পাঠানো যায়নি, আবার চেষ্টা করুন");
    }
  }

  if (status === "done") {
    return (
      <div className="cb-form-card cb-done">
        <div className="cb-done-ico">✓</div>
        <h3>{text.success_title}</h3>
        <p>{text.success_text}</p>
        <p className="cb-done-total">মোট: ৳{bn(total)}</p>
      </div>
    );
  }

  return (
    <form className="cb-form-card" ref={formRef} onSubmit={onSubmit} onBlur={saveDraft} onFocus={onStart}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="cb-hp" aria-hidden="true" />
      <h3>{text.form_title}</h3>
      <p>{text.form_text}</p>
      <label htmlFor="cb-name">আপনার নাম *</label>
      <input id="cb-name" name="name" placeholder="আপনার সম্পূর্ণ নাম" required />
      <label htmlFor="cb-phone">মোবাইল নাম্বার *</label>
      <input id="cb-phone" name="phone" type="tel" inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX" required />
      <label htmlFor="cb-address">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
      <textarea id="cb-address" name="address" placeholder="বাসা/রোড, এলাকা, থানা, জেলা" required />
      <div className="cb-form-grid">
        <div>
          <label htmlFor="cb-qty">পরিমাণ</label>
          <select id="cb-qty" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
            {[1, 2, 3].map((n) => <option key={n} value={n}>{bn(n)}টি কম্বো</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cb-area">ডেলিভারি এলাকা</label>
          <select id="cb-area" value={area} onChange={(e) => setArea(e.target.value)}>
            {delivery.map((d) => <option key={d.id} value={d.id}>{d.label} — {freeShip ? "ফ্রি" : `৳${bn(d.charge)}`}</option>)}
          </select>
        </div>
      </div>
      <div className="cb-total">
        <span>কম্বো ৳{bn(subtotal)} + ডেলিভারি {freeShip ? "ফ্রি 🎉" : `৳${bn(charge)}`}</span>
        <b>মোট ৳{bn(total)}</b>
      </div>
      {error && <p className="cb-error">{error}</p>}
      <button className="cb-btn" disabled={status === "loading"}>
        {status === "loading" ? "অপেক্ষা করুন..." : `${text.submit_btn} — ৳${bn(total)}`}
      </button>
      <div className="cb-small">💵 ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন</div>
    </form>
  );
}
