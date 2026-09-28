import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";
import { ratingCreateSchema } from "@/lib/validation";

function hashIp(ip: string): string | null {
  const salt = process.env.IP_HASH_SALT;
  if (!salt || !ip) return null;
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = ratingCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip) ?? "anon";

  if (!rateLimit(ipHash, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const business = await prisma.business.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const rating = await prisma.rating.create({
    data: {
      businessId: business.id,
      score: parsed.data.score,
      reasons: parsed.data.reasons,
      message: parsed.data.message || null,
      userAgent: request.headers.get("user-agent"),
      ipHash: ipHash === "anon" ? null : ipHash,
    },
  });

  return NextResponse.json({ id: rating.id }, { status: 201 });
}
