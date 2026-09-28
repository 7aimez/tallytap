"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type Props = { value: string; fullScreenHref?: string };

export default function QrCard({ value, fullScreenHref }: Props) {
  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(value, { width: 320, margin: 1 }).then(setPngDataUrl).catch(() => setPngDataUrl(""));
    QRCode.toString(value, { type: "svg", margin: 1 }).then(setSvg).catch(() => setSvg(""));
  }, [value]);

  const download = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
  };

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    download(url, "tallytap-qr.svg");
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card grid" style={{ gap: 12, justifyItems: "center" }}>
      <h2 style={{ margin: 0, justifySelf: "start" }}>QR code</h2>
      {pngDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pngDataUrl} alt="Business QR code" style={{ width: "100%", maxWidth: 260, borderRadius: 16 }} />
      ) : (
        <p className="muted">Generating QR…</p>
      )}
      <div className="actions" style={{ marginTop: 0 }}>
        <button className="btn" type="button" onClick={() => pngDataUrl && download(pngDataUrl, "tallytap-qr.png")}>Download PNG</button>
        <button className="btn btn--ghost" type="button" onClick={downloadSvg}>Download SVG</button>
        {fullScreenHref ? <a className="btn btn--ghost" href={fullScreenHref}>Open full-screen</a> : null}
      </div>
    </div>
  );
}
