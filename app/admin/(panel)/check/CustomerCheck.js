"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { lookupPhoneAction, reportPhoneAction, unblock } from "../../actions";

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

// Shob courier er row shobshomoy dekhai — parcel na thakle 0
const COURIERS = ["Pathao", "SteadFast", "Redx", "CarryBee", "PaperFly", "ParcelDex"];
function allCouriers(list) {
  const found = new Map(list.map((c) => [c.name.toLowerCase(), c]));
  const rows = COURIERS.map((name) => found.get(name.toLowerCase()) || { name, total: 0, delivered: 0, returned: 0 });
  const extra = list.filter((c) => !COURIERS.some((n) => n.toLowerCase() === c.name.toLowerCase()));
  return [...rows, ...extra].sort((a, b) => b.total - a.total);
}

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

// Courier merchant der report + amader nijer report (block), ar notun report deyar form
function Reports({ res, onDone }) {
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, startBusy] = useTransition();
  const list = res.history?.report_list || [];
  const count = res.history?.reports || 0;

  const submit = (e) => {
    e.preventDefault();
    startBusy(async () => {
      const r = await reportPhoneAction(res.phone, reason);
      if (r?.error) return setMsg(r.error);
      setReason("");
      setMsg("");
      onDone();
    });
  };
  const remove = () =>
    startBusy(async () => {
      await unblock("phone", res.phone);
      onDone();
    });

  return (
    <div className="adm-box chk-reports">
      <h3>⚠️ ফ্রড রিপোর্ট ({count + (res.blocked ? 1 : 0)})</h3>

      {res.blocked && (
        <div className="chk-report own">
          <b>🚫 আপনার রিপোর্ট — এই নাম্বার ব্লক করা (ওয়েবসাইটে অর্ডার করতে পারবে না)</b>
          <span>{res.blocked.reason || "কারণ লেখা নেই"}</span>
          <small>
            {fmtDate(res.blocked.at)} •{" "}
            <button type="button" className="adm-link" onClick={remove} disabled={busy}>রিপোর্ট তুলে নিন (আনব্লক)</button>
          </small>
        </div>
      )}

      {list.length > 0 ? (
        list.map((r, i) => (
          <div key={i} className="chk-report">
            <b>{r.courier ? `${r.courier} মার্চেন্টের রিপোর্ট` : "মার্চেন্টের রিপোর্ট"}{r.name ? ` — ${r.name}` : ""}</b>
            {r.details && <span>{r.details}</span>}
            {r.at && <small>{fmtDate(r.at)}</small>}
          </div>
        ))
      ) : count > 0 ? (
        <p className="adm-muted">{count}টি রিপোর্ট আছে (বিস্তারিত পাওয়া যায়নি)</p>
      ) : (
        !res.blocked && <p className="adm-muted">✅ কোনো কুরিয়ারে এই নাম্বারের বিরুদ্ধে রিপোর্ট নেই</p>
      )}

      {!res.blocked && (
        <form className="chk-report-form" onSubmit={submit}>
          <label>
            নিজে রিপোর্ট করুন
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="কী হয়েছে? যেমন: পার্সেল রিসিভ করেনি, ফেক অর্ডার, ফোন ধরে না"
              maxLength={300}
            />
          </label>
          <button className="adm-btn danger" disabled={busy}>{busy ? "…" : "🚫 রিপোর্ট / ব্লক করুন"}</button>
          {msg && <small className="adm-err">{msg}</small>}
          <small className="adm-muted">
            রিপোর্ট করলে নাম্বারটা আপনার ব্লক লিস্টে যাবে — ওয়েবসাইট থেকে আর অর্ডার করতে পারবে না। পরে এখান থেকেই তুলে নিতে পারবেন।
          </small>
        </form>
      )}
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
        <>
        <div className="adm-grid even">
          <div className="adm-box">
            <h3>📦 কুরিয়ার হিস্টরি — {res.phone}</h3>
            {(res.blocked || h?.reports > 0) && (
              <p className="chk-alert">
                🚨 সাবধান — এই নাম্বারের বিরুদ্ধে {res.blocked ? "আপনার রিপোর্ট" : ""}
                {res.blocked && h?.reports > 0 ? " ও " : ""}
                {h?.reports > 0 ? `${h.reports}টি মার্চেন্ট রিপোর্ট` : ""} আছে — নিচে দেখুন
              </p>
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
                {(
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th>কুরিয়ার</th><th>মোট</th><th>রিসিভ</th><th>রিটার্ন</th><th>রিসিভ %</th></tr></thead>
                      <tbody>
                        {allCouriers(h.couriers).map((c) => {
                          const done = c.delivered + c.returned;
                          return (
                            <tr key={c.name} className={c.total ? "" : "chk-zero"}>
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
        <Reports res={res} onDone={() => check()} />
        </>
      )}
    </div>
  );
}
