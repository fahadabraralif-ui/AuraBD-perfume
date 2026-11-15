"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendTestPush, removePushDevice } from "../../actions";

export function TestPushButton() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(null);
  return (
    <div className="adm-form-foot">
      <button
        className="adm-btn ghost"
        disabled={pending}
        onClick={() => startTransition(async () => setSent((await sendTestPush()).sent))}
      >
        {pending ? "পাঠানো হচ্ছে..." : "🔔 টেস্ট নোটিফিকেশন পাঠান"}
      </button>
      {sent !== null && !pending && (
        sent > 0
          ? <span className="adm-ok">✓ {sent}টি ফোনে পাঠানো হয়েছে</span>
          : <span className="adm-err">কোনো ফোনে যায়নি — অ্যাপ আবার খুলে লগইন করুন</span>
      )}
    </div>
  );
}

export function RemoveDeviceButton({ token, name }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="adm-btn sm danger"
      disabled={pending}
      onClick={() =>
        confirm(`${name} সরিয়ে দেবেন? এই ফোনে আর নোটিফিকেশন যাবে না।`) &&
        startTransition(async () => { await removePushDevice(token); router.refresh(); })
      }
    >
      সরান
    </button>
  );
}
