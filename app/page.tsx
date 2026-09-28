"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, businessName }),
    });

    setLoading(false);

    if (!response.ok) {
      setError("Could not create account");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 42 }}>
      <section className="grid" style={{ gap: 24 }}>
        <div>
          <h1 className="page-title">Know how every visit went. In ten seconds.</h1>
          <div className="emojis" style={{ marginTop: 20, maxWidth: 320 }} aria-hidden="true">
            <span className="emoji-btn" style={{ pointerEvents: "none" }}><i className="fa-solid fa-face-angry" style={{ color: "var(--r1)" }} /></span>
            <span className="emoji-btn" style={{ pointerEvents: "none" }}><i className="fa-solid fa-face-frown" style={{ color: "var(--r2)" }} /></span>
            <span className="emoji-btn" style={{ pointerEvents: "none" }}><i className="fa-solid fa-face-meh" style={{ color: "var(--r3)" }} /></span>
            <span className="emoji-btn" style={{ pointerEvents: "none" }}><i className="fa-solid fa-face-smile" style={{ color: "var(--r4)" }} /></span>
            <span className="emoji-btn" style={{ pointerEvents: "none" }}><i className="fa-solid fa-face-grin-stars" style={{ color: "var(--r5)" }} /></span>
          </div>
        </div>

        <div className="card grid" style={{ gap: 14 }}>
          <h2 style={{ margin: 0 }}>How it works</h2>
          <div className="muted" style={{ display: "grid", gap: 10 }}>
            <div><i className="fa-solid fa-user-plus" aria-hidden="true" /> Sign up</div>
            <div><i className="fa-solid fa-qrcode" aria-hidden="true" /> Print your QR</div>
            <div><i className="fa-solid fa-chart-line" aria-hidden="true" /> Watch ratings come in</div>
          </div>
        </div>

        <form className="card grid" style={{ gap: 12 }} onSubmit={onSubmit}>
          <h2 style={{ margin: 0 }}>Create your account</h2>
          <label className="label">Email<input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="label">Password<input className="input" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <label className="label">Business name<input className="input" required value={businessName} onChange={(event) => setBusinessName(event.target.value)} /></label>
          {error ? <p className="muted" role="alert">{error}</p> : null}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Creating..." : "Sign up"}</button>
          <p className="muted" style={{ margin: 0 }}>Already have an account? <Link href="/login" className="link">Log in</Link></p>
        </form>
      </section>
    </div>
  );
}
