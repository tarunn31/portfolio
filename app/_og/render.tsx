import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Open Graph card in the site's style: paper background, dot grid fading toward the middle, Geist type.
// next/og (Satori) cannot use CSS masks, so the fade is a paper-coloured overlay with the same stops.
export const OG_SIZE = { width: 1200, height: 630 };

// 22px grid of 1.3px dots, same as the site background, as an SVG pattern (Satori does not tile gradients).
const DOTS = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.4" fill="#C9C9C4"/></pattern></defs><rect width="1200" height="630" fill="#FBFBFA"/><rect width="1200" height="630" fill="url(#p)"/></svg>',
)}`;

const PAPER = "#FBFBFA";
const INK = "#111111";
const MUTED = "#6F6F6F";
const FAINT = "#8A8A8A";

// Literal paths so Next's file tracing bundles the fonts with the deployment.
const fonts = () =>
  Promise.all([
    readFile(join(process.cwd(), "app/_og/Geist-Medium.ttf")),
    readFile(join(process.cwd(), "app/_og/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "app/_og/GeistMono-Regular.ttf")),
  ]);

type Card = { eyebrow?: string; title: string; subtitle?: string; meta?: string; footer: string };

export async function renderCard({ eyebrow, title, subtitle, meta, footer }: Card) {
  const [medium, semibold, mono] = await fonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: PAPER,
          fontFamily: "Geist",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain elements, not next/image */}
        <img src={DOTS} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(251,251,250,0) 0%, rgba(251,251,250,0) 18%, rgba(251,251,250,0.86) 34%, rgba(251,251,250,0.86) 66%, rgba(251,251,250,0) 82%, rgba(251,251,250,0) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 96px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {eyebrow && (
              <div style={{ fontFamily: "Geist Mono", fontSize: 24, color: FAINT, marginBottom: 20 }}>{eyebrow}</div>
            )}
            <div
              style={{
                fontSize: title.length > 26 ? 64 : 76,
                fontWeight: 600,
                color: INK,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 34, color: MUTED, marginTop: 22, lineHeight: 1.35, maxWidth: 860, fontWeight: 500 }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {meta && (
              <div style={{ fontFamily: "Geist Mono", fontSize: 26, color: MUTED, display: "flex", marginBottom: 18 }}>{meta}</div>
            )}
            <div style={{ fontFamily: "Geist Mono", fontSize: 24, color: FAINT, display: "flex" }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: medium, weight: 500, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
