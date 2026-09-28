import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { generateUniqueSlug } from "@/lib/slug";
import { businessCreateSchema } from "@/lib/validation";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businesses = await prisma.business.findMany({
    where: { ownerId: userId },
    include: {
      _count: { select: { ratings: true } },
      ratings: {
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { score: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    businesses: businesses.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      logoUrl: b.logoUrl,
      feedbackEmail: b.feedbackEmail,
      googleReviewUrl: b.googleReviewUrl,
      createdAt: b.createdAt,
      ratingCount: b._count.ratings,
      avgScore30d: b.ratings.length ? b.ratings.reduce((sum, r) => sum + r.score, 0) / b.ratings.length : null,
    })),
  });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = businessCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const slug = await generateUniqueSlug(parsed.data.slug || parsed.data.name);

  const business = await prisma.business.create({
    data: {
      name: parsed.data.name,
      slug,
      logoUrl: parsed.data.logoUrl || null,
      googleReviewUrl: parsed.data.googleReviewUrl,
      feedbackEmail: parsed.data.feedbackEmail || null,
      ownerId: userId,
    },
  });

  return NextResponse.json({ business }, { status: 201 });
}
