import { sfReady, getFraudScore } from "./steadfast";

// BD Courier ekhon Steadfast er live hishab dey na (purono cache, beshirbhag 0).
// Tai Steadfast er official API (je key diye order pathai) theke ei number er Steadfast parcel hishab ani.
export const sfCheckReady = (s) => sfReady(s);

/** Steadfast e ei number er parcel: { name, total, delivered, returned, frauds } — API key na thakle null */
export async function steadfastCheck(phone, s) {
  if (!sfCheckReady(s)) return null;
  const json = await getFraudScore(s, phone);
  const delivered = Number(json.delivered_count) || 0;
  const returned = Number(json.cancelled_count) || 0;
  return {
    name: "SteadFast",
    total: delivered + returned,
    delivered,
    returned,
    frauds: Number(json.total_reports) || 0,
  };
}
