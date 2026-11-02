"use client";

import { useEffect, useState } from "react";
import { bn } from "@/data/site";

// Shudhu dekhanor jonno offer timer — proti 24 ghonta por abar shuru theke ghure ashe (shobai ek-i shomoy dekhe)
const PERIOD = 24 * 60 * 60 * 1000;
// Bangladesh er raat 12 tay reset hoy (UTC+6)
const BD_OFFSET = 6 * 60 * 60 * 1000;
const UNITS = [["দিন", 86400], ["ঘণ্টা", 3600], ["মিনিট", 60], ["সেকেন্ড", 1]];

const pad = (n) => bn(n).padStart(2, "০");

export default function Countdown() {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const tick = () => setLeft(Math.floor((PERIOD - ((Date.now() + BD_OFFSET) % PERIOD)) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown">
      <p className="countdown-title">🔥 অফার শেষ হতে বাকি</p>
      <div className="countdown-boxes">
        {UNITS.map(([label, sec], i) => {
          const value = left == null ? 0 : i === 0 ? Math.floor(left / sec) : Math.floor((left % UNITS[i - 1][1]) / sec);
          return (
            <div key={label} className="countdown-box">
              <b>{pad(value)}</b>
              <small>{label}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
