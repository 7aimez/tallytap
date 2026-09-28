import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { queryPageSchema } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const business = await prisma.business.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const parsed = queryPageSchema.safeParse({
    page: url.searchParams.get("page") ?? 1,
    pageSize: url.searchParams.get("pageSize") ?? 20,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { page, pageSize } = parsed.data;
  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.rating.count({ where: { businessId: id } }),
  ]);

  return NextResponse.json({ ratings, pagination: { page, pageSize, total } });
}
