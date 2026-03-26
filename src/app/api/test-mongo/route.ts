import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs"; // Ensure Node.js runtime (not Edge)
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    const elapsed = Date.now() - start;
    return NextResponse.json({
      ok: true,
      elapsed_ms: elapsed,
      collections: collections.map((c) => c.name),
    });
  } catch (err: unknown) {
    const elapsed = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, elapsed_ms: elapsed, error }, { status: 500 });
  }
}
