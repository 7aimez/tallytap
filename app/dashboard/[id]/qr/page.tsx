import { notFound } from "next/navigation";
import QrCard from "@/components/dashboard/QrCard";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export default async function BusinessQrPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const { id } = await params;
  const business = await prisma.business.findFirst({
    where: { id, ownerId: userId },
    select: { id: true, slug: true, name: true },
  });

  if (!business) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <main className="grid" style={{ minHeight: "80dvh", placeItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ textAlign: "center" }}>{business.name}</h1>
        <QrCard value={`${appUrl}/r/${business.slug}`} />
      </div>
    </main>
  );
}
