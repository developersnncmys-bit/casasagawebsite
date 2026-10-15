import { revalidatePath, revalidateTag } from "next/cache";

// Called by the CasaSaga API after the admin changes content, so the site updates at once
export async function POST(req) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag("content");
  revalidatePath("/", "layout");
  return Response.json({ ok: true, at: new Date().toISOString() });
}
