import { getSettings } from "@/lib/store";
import { pushEnabled, listDevices } from "@/lib/push";
import { saveSettingsAction } from "../../actions";
import SaveForm from "../SaveForm";
import { TestPushButton, RemoveDeviceButton } from "./AppButtons";

const fmt = (d) =>
  new Date(d).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });

export default async function AppPage() {
  const [s, devices] = await Promise.all([getSettings(), pushEnabled() ? listDevices() : []]);

  return (
    <>
      <h1 className="adm-title">অ্যাপ নোটিফিকেশন</h1>
      <p className="adm-muted adm-intro">
        মোবাইলে অ্যাডমিন অ্যাপ ইনস্টল করুন — নতুন অর্ডার এলেই ফোনে নোটিফিকেশন আসবে, অ্যাপ বন্ধ থাকলেও।
      </p>

      {!pushEnabled() && (
        <div className="adm-box"><p className="adm-err">FIREBASE_SERVICE_ACCOUNT সেট করা নেই — Vercel এ Environment Variable যোগ করে Redeploy দিন।</p></div>
      )}

      <div className="adm-grid even">
        <div className="adm-box">
          <h3>ধাপ ১ — অ্যাপ ইনস্টল করুন</h3>
          <p className="adm-muted">Android ফোনে এই পেজ খুলে নিচের বাটন চাপুন। ইনস্টলের সময় “Unknown apps” অনুমতি চাইলে দিন।</p>
          <div className="adm-form-foot">
            <a className="adm-btn" href="/ayaat-admin.apk" download>📲 অ্যাপ ডাউনলোড (APK)</a>
          </div>
          <h3 className="mt">ধাপ ২ — লগইন করুন</h3>
          <p className="adm-muted">
            অ্যাপ খুলে অ্যাডমিন পাসওয়ার্ড দিয়ে লগইন করুন, নোটিফিকেশনের অনুমতি চাইলে <b>Allow</b> দিন। ফোনটা নিচের তালিকায় চলে আসবে।
          </p>
          <p className="adm-muted tg-warn">
            ⚠️ Xiaomi / Oppo / Vivo / Realme ফোনে: অ্যাপের Settings → Battery → <b>No restrictions</b> আর <b>Autostart</b> চালু করুন, না হলে অ্যাপ বন্ধ থাকলে নোটিফিকেশন দেরিতে আসতে পারে।
          </p>
        </div>

        <div className="adm-box">
          <h3>কানেক্ট করা ফোন ({devices.length})</h3>
          {devices.length === 0 ? (
            <p className="adm-muted">এখনো কোনো ফোন কানেক্ট হয়নি — অ্যাপে লগইন করুন, তারপর পেজ রিফ্রেশ দিন।</p>
          ) : (
            <ul className="adm-list">
              {devices.map((d) => (
                <li key={d.token}>
                  <span>
                    📱 <b>{d.device || "Android"}</b>
                    <small className="adm-muted"> • শেষ দেখা {fmt(d.last_seen)}</small>
                  </span>
                  <RemoveDeviceButton token={d.token} name={d.device || "এই ফোন"} />
                </li>
              ))}
            </ul>
          )}
          {devices.length > 0 && <TestPushButton />}

          <h3 className="mt">কোন নোটিফিকেশন আসবে</h3>
          <SaveForm action={saveSettingsAction}>
            <label>
              🛒 নতুন অর্ডার
              <select disabled defaultValue="on"><option value="on">সবসময় চালু</option></select>
            </label>
            <label>
              ⏳ অসম্পূর্ণ অর্ডার (নাম্বার দিয়ে চলে গেছে)
              <select name="push_notify_incomplete" defaultValue={s.push_notify_incomplete}>
                <option value="on">চালু</option>
                <option value="off">বন্ধ</option>
              </select>
            </label>
          </SaveForm>
        </div>
      </div>
    </>
  );
}
