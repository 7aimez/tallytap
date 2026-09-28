import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) return null;

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

  return (
    <main className="grid" style={{ gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h1 style={{ margin: 0 }}>Businesses</h1>
        <Link className="btn" href="/dashboard/new">Add business</Link>
      </div>

      {!businesses.length ? (
        <Link href="/dashboard/new" className="card" style={{ textDecoration: "none", display: "grid", placeItems: "center", minHeight: 180, fontSize: 20, fontWeight: 600 }}>
          Add your first business
        </Link>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {businesses.map((business) => {
            const avg = business.ratings.length
              ? business.ratings.reduce((sum, rating) => sum + rating.score, 0) / business.ratings.length
              : null;
            return (
              <Link key={business.id} href={`/dashboard/${business.id}`} className="card" style={{ textDecoration: "none", display: "grid", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="brand-mark" style={{ width: 34, height: 34 }}>
                    {business.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={business.logoUrl} alt="" />
                    ) : (
                      business.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <strong>{business.name}</strong>
                </div>
                <p className="muted" style={{ margin: 0 }}>{business._count.ratings} ratings</p>
                <p className="muted" style={{ margin: 0 }}>Avg (30d): {avg ? avg.toFixed(1) : "—"}</p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
