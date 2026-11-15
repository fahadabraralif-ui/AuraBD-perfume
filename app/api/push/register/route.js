import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { addDevice, removeDevice } from "@/lib/push";

// Android admin app login thaka obosthay nijer FCM token ekhane pathay (admin cookie diye)
export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  try {
    await addDevice(body?.token, body?.device);
    revalidatePath("/admin/app");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Push register failed", err);
    return Response.json({ ok: false }, { status: 400 });
  }
}

export async function DELETE(req) {
  if (!(await isAdmin())) return Response.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.token) await removeDevice(body.token);
  return Response.json({ ok: true });
}
