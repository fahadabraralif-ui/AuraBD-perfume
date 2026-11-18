"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { courierAutoSyncAction } from "../actions";

// Admin screen e dekha gele 15 minute por por courier status ane; kichu bodlale page nijei notun hoy.
// Tab/app background e thakle sync hoy na — jate Neon database ghumate pare (compute hours bachay).
const EVERY = 15 * 6e4;

export default function CourierAutoSync() {
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    let last = 0;
    const run = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < EVERY) return;
      last = Date.now();
      courierAutoSyncAction()
        .then((n) => alive && n > 0 && router.refresh())
        .catch(() => {});
    };
    run();
    const t = setInterval(run, 60e3);
    document.addEventListener("visibilitychange", run);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", run);
    };
  }, [router]);
  return null;
}
