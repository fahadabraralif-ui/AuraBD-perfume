import { getSettings, getProducts, deliveryOptions } from "@/lib/store";
import { inboxAuthorized, unauthorized } from "@/lib/inboxAuth";

export const dynamic = "force-dynamic";

// Inbox er order form er jonno: sokrio pondo + delivery charge
export async function GET(req) {
  if (!inboxAuthorized(req)) return unauthorized();
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  return Response.json({
    ok: true,
    products: products.map((p) => ({
      id: p.id, name: p.name, price: Number(p.price), stock: Number(p.stock), boxes: Number(p.boxes) || 1,
    })),
    areas: deliveryOptions(settings),
    freeBoxes: Number(settings.free_delivery_boxes) || 0,
  });
}
