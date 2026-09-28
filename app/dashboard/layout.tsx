import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="container" style={{ minHeight: "100dvh", paddingTop: 20, paddingBottom: 40 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link href="/dashboard" className="link" style={{ textDecoration: "none", fontWeight: 650 }}>TallyTap</Link>
        <form action="/api/auth/logout" method="post">
          <button className="btn btn--ghost" type="submit" aria-label="Log out">Log out</button>
        </form>
      </header>
      {children}
    </div>
  );
}
