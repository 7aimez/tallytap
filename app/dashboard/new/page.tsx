"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBusinessPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, logoUrl, googleReviewUrl, feedbackEmail }),
    });

    if (!response.ok) {
      setError("Could not create business");
      return;
    }

    const data = (await response.json()) as { business: { id: string } };
    router.push(`/dashboard/${data.business.id}`);
  };

  return (
    <main className="grid" style={{ gap: 16 }}>
      <h1 style={{ margin: 0 }}>New business</h1>
      <form className="card grid" style={{ gap: 12, maxWidth: 600 }} onSubmit={onSubmit}>
        <label className="label">Name<input className="input" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="label">Slug (optional)<input className="input" value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
        <label className="label">Logo URL<input className="input" type="url" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} /></label>
        <label className="label">Google review URL<input className="input" type="url" value={googleReviewUrl} onChange={(event) => setGoogleReviewUrl(event.target.value)} required /></label>
        <label className="label">Feedback email<input className="input" type="email" value={feedbackEmail} onChange={(event) => setFeedbackEmail(event.target.value)} /></label>
        {error ? <p className="muted" role="alert">{error}</p> : null}
        <button className="btn" type="submit">Create business</button>
      </form>
    </main>
  );
}
