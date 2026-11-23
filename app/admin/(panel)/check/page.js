import { STATUSES } from "@/lib/db";
import { getSettings } from "@/lib/store";
import { bdcKey } from "@/lib/bdcourier";
import { sfCheckReady } from "@/lib/steadfastFraud";
import CustomerCheck from "./CustomerCheck";

// Call/message e asha customer er number diye BD Courier hishab + amader ager order dekha
export default async function CheckPage({ searchParams }) {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const labels = Object.fromEntries(STATUSES.map((x) => [x.id, x.label]));
  return (
    <>
      <h1 className="adm-title">কাস্টমার চেক (ফ্রড চেকার)</h1>
      <p className="adm-muted">
        কল বা মেসেজে অর্ডার আসলে কাস্টমারের নাম্বার দিন — BD Courier থেকে সব কুরিয়ারে (Steadfast, Pathao, RedX…) তার
        পার্সেল রিসিভ/রিটার্নের হিসাব আর আমাদের সাইটে আগের অর্ডার দেখাবে।
      </p>
      {!bdcKey(s) && (
        <p className="adm-err">BD Courier API key দেওয়া নেই — <a href="/admin/fraud">ফেক অর্ডার প্রোটেকশন</a> পেজে key দিন।</p>
      )}
      {!sfCheckReady(s) && (
        <p className="adm-err">
          Steadfast এর লাইভ হিসাব দেখতে <a href="/admin/courier">কুরিয়ার</a> পেজে Steadfast API Key আর Secret Key দিন।
        </p>
      )}
      <CustomerCheck labels={labels} initial={typeof sp?.phone === "string" ? sp.phone : ""} />
    </>
  );
}
