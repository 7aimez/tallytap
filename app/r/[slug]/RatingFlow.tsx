"use client";

import { FormEvent, useMemo, useState } from "react";

type Screen = "screen-rate" | "screen-google" | "screen-form" | "screen-done";

type Business = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  googleReviewUrl: string;
};

const chips = ["Wait time", "Staff", "Quality", "Cleanliness", "Price", "Other"];

const ratingLabels = [
  { score: 1, word: "terrible", icon: "fa-face-angry" },
  { score: 2, word: "bad", icon: "fa-face-frown" },
  { score: 3, word: "okay", icon: "fa-face-meh" },
  { score: 4, word: "good", icon: "fa-face-smile" },
  { score: 5, word: "amazing", icon: "fa-face-grin-stars" },
] as const;

export default function RatingFlow({ business }: { business: Business }) {
  const [current, setCurrent] = useState<Screen>("screen-rate");
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [doneMessage, setDoneMessage] = useState("Your feedback has been sent to the team.");
  const [sending, setSending] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const brandInitial = useMemo(() => business.name.trim().charAt(0).toUpperCase() || "★", [business.name]);

  const go = (screen: Screen) => {
    setCurrent(screen);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const postRating = async (payload: { score: number; reasons: string[]; message?: string }) => {
    await fetch("/api/public/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: business.slug, ...payload }),
    });
  };

  const onPick = (pickedScore: number) => {
    if (picked !== null) return;
    setScore(pickedScore);
    setPicked(pickedScore);

    if (navigator.vibrate) navigator.vibrate(8);

    if (pickedScore >= 4) {
      postRating({ score: pickedScore, reasons: [] }).catch(() => undefined);
    }

    setTimeout(() => {
      go(pickedScore >= 4 ? "screen-google" : "screen-form");
    }, 430);
  };

  const goBack = () => {
    setPicked(null);
    go("screen-rate");
  };

  const toggleChip = (chip: string) => {
    setSelectedReasons((prev) => (prev.includes(chip) ? prev.filter((v) => v !== chip) : [...prev, chip]));
    if (navigator.vibrate) navigator.vibrate(4);
  };

  const showDone = (text: string) => {
    setDoneMessage(text);
    go("screen-done");
    if (navigator.vibrate) navigator.vibrate([6, 40, 12]);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);

    try {
      await postRating({ score, reasons: selectedReasons, message: message.trim() || undefined });
    } finally {
      setSending(false);
      showDone("Your note goes straight to the team. We’ll make it right.");
    }
  };

  const onReset = () => {
    setScore(0);
    setPicked(null);
    setSelectedReasons([]);
    setMessage("");
    go("screen-rate");
  };

  const canShowLogo = Boolean(business.logoUrl) && logoLoaded && !logoError;

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn" aria-label="Go back" hidden={!(current === "screen-google" || current === "screen-form")} onClick={goBack}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div className="brand">
          <span className={`brand-mark ${canShowLogo ? "has-logo" : ""}`}>
            {canShowLogo && business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt="" />
            ) : (
              brandInitial
            )}
          </span>
          <span>{business.name}</span>
        </div>
      </header>

      {business.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={business.logoUrl}
          alt=""
          aria-hidden="true"
          style={{ display: "none" }}
          onLoad={() => setLogoLoaded(true)}
          onError={() => setLogoError(true)}
        />
      ) : null}

      <main className="stage">
        <section className={`screen ${current === "screen-rate" ? "is-active" : ""}`} aria-hidden={current !== "screen-rate"}>
          <h1>How was your visit?</h1>
          <p className="sub">Tap the face that fits. It takes ten seconds.</p>

          <div className={`emojis ${picked !== null ? "has-pick" : ""}`} role="group" aria-label="Rate your experience from 1 to 5">
            {ratingLabels.map((item) => (
              <button
                key={item.score}
                className={`emoji-btn ${picked === item.score ? "is-picked" : ""}`}
                data-score={item.score}
                aria-label={`${item.score} out of 5, ${item.word}`}
                onClick={() => onPick(item.score)}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              </button>
            ))}
          </div>

          <p className="hint">1 · poor &nbsp;—&nbsp; 5 · amazing</p>
        </section>

        <section className={`screen ${current === "screen-google" ? "is-active" : ""}`} aria-hidden={current !== "screen-google"}>
          <div className="stars" aria-hidden="true">
            <i className="fa-solid fa-star" />
            <i className="fa-solid fa-star" />
            <i className="fa-solid fa-star" />
            <i className="fa-solid fa-star" />
            <i className="fa-solid fa-star" />
          </div>
          <h1>That&apos;s great to hear</h1>
          <p className="sub">Would you mind sharing it on Google? It helps other people find us.</p>
          <div className="actions">
            <a className="btn" href={business.googleReviewUrl} target="_blank" rel="noopener noreferrer" onClick={() => setTimeout(() => showDone("Thanks for spreading the word — it really helps."), 700)}>
              <i className="fa-solid fa-star" aria-hidden="true" />
              Leave a Google review
            </a>
            <button className="btn btn--ghost" type="button" onClick={() => showDone("Thanks for letting us know.")}>Maybe later</button>
          </div>
        </section>

        <section className={`screen ${current === "screen-form" ? "is-active" : ""}`} aria-hidden={current !== "screen-form"}>
          <h1>Sorry we missed the mark</h1>
          <p className="sub">What went wrong? Your note goes straight to the team.</p>
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="chips" role="group" aria-label="What went wrong?">
              {chips.map((chip) => {
                const on = selectedReasons.includes(chip);
                return (
                  <button key={chip} type="button" className="chip" aria-pressed={on} data-val={chip} onClick={() => toggleChip(chip)}>
                    {chip}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={3}
              placeholder="Anything else? (optional)"
              aria-label="Tell us more"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <button className="btn" type="submit" disabled={sending}>
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              <span>{sending ? "Sending…" : "Send feedback"}</span>
            </button>
          </form>
        </section>

        <section className={`screen ${current === "screen-done" ? "is-active" : ""}`} aria-hidden={current !== "screen-done"}>
          <svg className="check" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" />
            <path d="M16 27.5 L23 34.5 L36.5 19" />
          </svg>
          <h1>Thank you</h1>
          <p className="sub">{doneMessage}</p>
          <div className="actions">
            <button className="btn btn--ghost" type="button" onClick={onReset}>Back to start</button>
          </div>
        </section>
      </main>
    </div>
  );
}
