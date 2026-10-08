// Content Security Policy. Scripts need 'unsafe-inline' because Next.js and the theme script (which stops the
// dark-mode flash) are inline; there is no user-supplied HTML anywhere, and everything else is locked to this
// origin: no external scripts, images, fonts, media or connections, no framing, no plugins, no form targets.
// Only sent in production (see buildSecurityHeaders): the dev server needs eval for hot reload.
export const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const buildSecurityHeaders = (production: boolean) => [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(production ? [{ key: "Content-Security-Policy", value: csp }] : []),
];
