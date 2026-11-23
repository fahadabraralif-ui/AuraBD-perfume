"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { lookupPhoneAction } from "../../actions";

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

function Verdict({ h }) {
  if (!h.total) {
    return (
      <div className="chk-verdict new">
        <b>🆕 নতুন কাস্টমার</b>
        <span>কোনো কুরিয়ারে আগে পার্সেল নেই — ফোনে কথা বলে কনফার্ম করুন</span>
      </div>
    );
  }
  const level = h.rate >= 80 ? "good" : h.rate >= 50 ? "mid" : "bad";
  const text = {
    good: ["🛡️ ভরসাযোগ্য কাস্টমার", "বেশিরভাগ পার্সেল রিসিভ করেছে"],
    mid: ["⚠️ সাবধানে কনফার্ম করুন", "অনেক পার্সেল ফেরত দিয়েছে — অগ্রিম ডেলিভারি চার্জ নিতে পারেন"],
    bad: ["🚨 ঝুঁকিপূর্ণ কাস্টমার", "বেশিরভাগ পার্সেল রিসিভ করেনি — অগ্রিম টাকা ছাড়া পাঠাবেন না"],
  }[level];
  return (
    <div className={`chk-verdict ${level}`}>
      <span className="chist-ring" style={{ "--p": h.rate }}><b>{h.rate}%</b></span>
      <div>
        <b>{text[0]}</b>
        <span>{text[1]}</span>
        <span className="chist-nums">✅ রিসিভ <b>{h.rate}%</b> <i>|</i> ↩️ রিটার্ন <b>{100 - h.rate}%</b></span>
      </div>
    </div>
  );
}

export default function CustomerCheck({ labels, initial = "" }) {
  const [phone, setPhone] = useState(initial);
  const [res, setRes] = useState(null);
  const [pending, start] = useTransition();

  const check = (force = false) =>
    start(async () => {
      setRes(await lookupPhoneAction(phone, force));
    });

  useEffect(() => {
    if (initial) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const h = res?.history;
  return (
    <div className="chk">
      <form
        className="adm-box chk-form"
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <label>
          কাস্টমারের মোবাইল নাম্বার
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            inputMode="tel"
            autoFocus
            required
          />
        </label>
        <button className="adm-btn" disabled={pending}>{pending ? "চেক হচ্ছে…" : "🔍 চেক করুন"}</button>
      </form>

      {res?.error && !res.ok && <p className="adm-err">{res.error}</p>}

      {res?.ok && (
        <div className="adm-grid even">
          <div className="adm-box">
            <h3>📦 কুরিয়ার হিস্টরি — {res.phone}</h3>
            {res.blocked && (
              <p className="adm-err">🚫 এই নাম্বার ব্লক করা আছে{res.blocked.reason ? ` (${res.blocked.reason})` : ""}</p>
            )}
            {res.error && <p className="adm-err">{res.error}</p>}
            {h && (
              <>
                <Verdict h={h} />
                {h.sf_error ? (
                  <p className="adm-err">⚠️ Steadfast এর হিসাব আনা যায়নি: {h.sf_error}</p>
                ) : h.sf_live ? (
                  <small className="adm-muted">✅ Steadfast এর হিসাব Steadfast থেকে সরাসরি (লাইভ)</small>
                ) : (
                  <small className="adm-muted">
                    ⚠️ Steadfast এর লাইভ হিসাব নেই — <a href="/admin/courier">কুরিয়ার</a> পেজে Steadfast API Key দিন
                  </small>
                )}
                <div className="adm-cards chk-cards">
                  <div className="adm-card"><small>মোট পার্সেল</small><b>{h.total}</b></div>
                  <div className="adm-card"><small>রিসিভ</small><b className="chk-g">{h.delivered}</b></div>
                  <div className="adm-card"><small>রিটার্ন/বাতিল</small><b className="chk-r">{h.returned}</b></div>
                  <div className="adm-card"><small>ফ্রড রিপোর্ট</small><b className={h.reports ? "chk-r" : ""}>{h.reports}</b></div>
                </div>
                {h.couriers.length > 0 && (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>কুরিয়ার</th><th>মোট</th><th>রিসিভ</th><th>রিটার্ন</th><th>রিসিভ %</th></tr></thead>
                      <tbody>
                        {h.couriers.map((c) => {
                          const done = c.delivered + c.returned;
                          return (
                            <tr key={c.name}>
                              <td><b>{c.name}</b></td>
                              <td>{c.total}</td>
                              <td>{c.delivered}</td>
                              <td>{c.returned}</td>
                              <td>{done ? `${Math.round((c.delivered / done) * 100)}%` : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <small className="adm-muted">
                  চেক করা হয়েছে: {fmtDate(h.checked_at)} •{" "}
                  <button type="button" className="adm-link" onClick={() => check(true)} disabled={pending}>
                    ⟳ নতুন করে আনুন
                  </button>
                </small>
              </>
            )}
          </div>

          <div className="adm-box">
            <h3>🧾 আমাদের সাইটে আগের অর্ডার</h3>
            {res.own.total === 0 ? (
              <p className="adm-muted">এই নাম্বার থেকে আগে কোনো অর্ডার আসেনি</p>
            ) : (
              <>
                <p>
                  মোট <b>{res.own.total}</b> অর্ডার • ডেলিভারড <b className="chk-g">{res.own.delivered}</b> • বাতিল/রিটার্ন{" "}
                  <b className="chk-r">{res.own.bad}</b>
                </p>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>অর্ডার</th><th>পণ্য</th><th>টাকা</th><th>স্ট্যাটাস</th></tr></thead>
                    <tbody>
                      {res.recent.map((o) => (
                        <tr key={o.code}>
                          <td><b>{o.code}</b><small>{fmtDate(o.at)}</small><small>{o.name} — {o.address}</small></td>
                          <td>{o.product}</td>
                          <td>৳{o.total}</td>
                          <td><span className={`pill st-${o.status}`}>{labels[o.status] || o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <p className="mt">
              <Link className="adm-btn" href="/admin/orders/new">📞 এই কাস্টমারের অর্ডার বসান</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
