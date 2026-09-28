"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const next = search.get("next") || "/dashboard";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setError("Invalid credentials");
      return;
    }

    router.push(next);
  };

  return (
    <div className="container" style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      <form className="card grid" style={{ width: "100%", maxWidth: 420, gap: 12 }} onSubmit={onSubmit}>
        <h1>Log in</h1>
        <label className="label">Email<input className="input" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="label">Password<input className="input" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error ? <p className="muted" role="alert">{error}</p> : null}
        <button className="btn" type="submit">Log in</button>
        <p className="muted" style={{ margin: 0 }}>No account? <Link href="/signup" className="link">Sign up</Link></p>
      </form>
    </div>
  );
}
