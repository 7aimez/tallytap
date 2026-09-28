import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { generateUniqueSlug } from "@/lib/slug";
import { businessUpdateSchema } from "@/lib/validation";

async function requireOwnedBusiness(id: string, ownerId: string) {
  return prisma.business.findFirst({ where: { id, ownerId } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owned = await requireOwnedBusiness(id, userId);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await request.json().catch(() => null);
  const parsed = businessUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const data: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    googleReviewUrl?: string;
    feedbackEmail?: string | null;
  } = {};

  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.slug !== undefined) data.slug = await generateUniqueSlug(parsed.data.slug, id);
  if (parsed.data.logoUrl !== undefined) data.logoUrl = parsed.data.logoUrl || null;
  if (parsed.data.googleReviewUrl !== undefined) data.googleReviewUrl = parsed.data.googleReviewUrl;
  if (parsed.data.feedbackEmail !== undefined) data.feedbackEmail = parsed.data.feedbackEmail || null;

  const business = await prisma.business.update({ where: { id }, data });

  return NextResponse.json({ business });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const owned = await requireOwnedBusiness(id, userId);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
