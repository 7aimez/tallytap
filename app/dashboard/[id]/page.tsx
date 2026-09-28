import { notFound } from "next/navigation";
import BusinessSettingsForm from "@/components/dashboard/BusinessSettingsForm";
import QrCard from "@/components/dashboard/QrCard";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function parseReasons(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const { id } = await params;
  const business = await prisma.business.findFirst({
    where: { id, ownerId: userId },
    include: {
      ratings: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!business) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const ratingUrl = `${appUrl}/r/${business.slug}`;

  return (
    <main className="grid" style={{ gap: 16 }}>
      <h1 style={{ margin: 0 }}>{business.name}</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", alignItems: "start" }}>
        <BusinessSettingsForm business={business} />
        <div className="grid" style={{ gap: 12 }}>
          <QrCard value={ratingUrl} fullScreenHref={`/dashboard/${business.id}/qr`} />
          <div className="card grid" style={{ gap: 10 }}>
            <h2 style={{ margin: 0 }}>Latest ratings</h2>
            {business.ratings.length ? (
              business.ratings.map((rating) => {
                const reasons = parseReasons(rating.reasons);
                return (
                  <article key={rating.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <strong aria-label={`Score ${rating.score} out of 5`}>{rating.score}/5</strong>
                      <span className="muted">{relativeTime(rating.createdAt)}</span>
                    </div>
                    {reasons.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        {reasons.map((reason) => (
                          <span key={reason} className="chip" aria-label={`Reason: ${reason}`}>{reason}</span>
                        ))}
                      </div>
                    ) : null}
                    {rating.message ? <p style={{ margin: "8px 0 0" }}>{rating.message}</p> : null}
                  </article>
                );
              })
            ) : (
              <p className="muted" style={{ margin: 0 }}>No ratings yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
