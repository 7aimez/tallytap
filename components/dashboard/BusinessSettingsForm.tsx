"use client";

import { useMemo, useState } from "react";

type Business = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  googleReviewUrl: string;
  feedbackEmail: string | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export default function BusinessSettingsForm({ business }: { business: Business }) {
  const [name, setName] = useState(business.name);
  const [slug, setSlug] = useState(business.slug);
  const [logoUrl, setLogoUrl] = useState(business.logoUrl ?? "");
  const [googleReviewUrl, setGoogleReviewUrl] = useState(business.googleReviewUrl);
  const [feedbackEmail, setFeedbackEmail] = useState(business.feedbackEmail ?? "");
  const [status, setStatus] = useState<string | null>(null);

  const slugPreview = useMemo(() => slugify(slug || name), [name, slug]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Saving...");

    const response = await fetch(`/api/businesses/${business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, logoUrl, googleReviewUrl, feedbackEmail }),
    });

    setStatus(response.ok ? "Saved" : "Could not save");
  };

  return (
    <form className="card grid" style={{ gap: 12 }} onSubmit={save}>
      <h2 style={{ margin: 0 }}>Settings</h2>
      <label className="label">Name<input className="input" value={name} onChange={(event) => setName(event.target.value)} required /></label>
      <label className="label">Slug
        <input className="input" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <span className="muted" aria-live="polite">Preview: /r/{slugPreview}</span>
      </label>
      <label className="label">Logo URL<input className="input" type="url" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} /></label>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Live logo preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "contain" }} />
      ) : null}
      <label className="label">Google review URL<input className="input" type="url" value={googleReviewUrl} onChange={(event) => setGoogleReviewUrl(event.target.value)} required /></label>
      <label className="label">Feedback email<input className="input" type="email" value={feedbackEmail} onChange={(event) => setFeedbackEmail(event.target.value)} /></label>
      <button className="btn" type="submit">Save changes</button>
      {status ? <p className="muted" style={{ margin: 0 }} aria-live="polite">{status}</p> : null}
    </form>
  );
}
