// Offline checks for the command palette, SEO files and the site's hard copy rules. `npm run test:site`.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildSecurityHeaders, csp } from "../lib/security-headers";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { caseStudies } from "../content/case-studies";
import { paletteItems } from "../content/palette";
import { site } from "../content/site";
import { buildSources } from "../lib/ask/sources";

const root = new URL("..", import.meta.url).pathname;
const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const sourceFiles = ["app", "components", "content", "lib", "scripts", ".github"]
  .flatMap((d) => walk(join(root, d)))
  .filter((f) => /\.(tsx?|mjs|json|md|ya?ml)$/.test(f) && !f.endsWith(".d.ts"));

test("palette has exactly the groups and entries the spec lists", () => {
  const by = (g) => paletteItems.filter((i) => i.group === g).map((i) => i.label);
  assert.deepEqual(by("Jump to"), [
    "Work",
    "Craft",
    "Ask",
    "Experience",
    "Contact",
    ...caseStudies.map((c) => c.shortName),
  ]);
  assert.deepEqual(by("Actions"), ["Download resume", "Copy email", "Toggle theme"]);
  assert.deepEqual(by("Links"), ["GitHub", "LinkedIn", "nita.care", "AI Data Copilot live demo"]);
  assert.equal(new Set(paletteItems.map((i) => i.id)).size, paletteItems.length);
});

test("palette jump targets exist and external links are https", () => {
  const hrefs = new Set(buildSources().map((s) => s.href));
  for (const i of paletteItems) {
    const a = i.action;
    if (a.kind === "nav") {
      const base = a.href.startsWith("/#") ? a.href : a.href;
      assert.ok(hrefs.has(base) || a.href.startsWith("/#"), `unknown target ${a.href}`);
    }
    if (a.kind === "external") assert.match(a.href, /^https:\/\//);
    if (a.kind === "download") assert.equal(a.href, "/resume.pdf");
    if (a.kind === "copy") assert.equal(a.text, site.email);
  }
});

test("sitemap lists the home page and every case study on the real domain; robots points at it", () => {
  const urls = sitemap().map((e) => e.url);
  assert.deepEqual(urls, [site.url, ...caseStudies.map((c) => `${site.url}/work/${c.slug}`)]);
  assert.ok(site.url.startsWith("https://"));
  const r = robots();
  assert.equal(r.sitemap, `${site.url}/sitemap.xml`);
  assert.equal(r.rules.disallow, "/api/");
});

test("hard rule: no em dashes anywhere in site code or copy", () => {
  const bad = sourceFiles
    .filter((f) => readFileSync(f, "utf8").includes("\u2014"))
    .map((f) => f.replace(root, ""));
  assert.deepEqual(bad, []);
});

test("hard rule: no phone number in code, tests, content or workflows (fake 555 test numbers are fine)", () => {
  const phone = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
  const bad = sourceFiles
    .filter((f) => !f.endsWith("ask-eval.json"))
    .filter((f) => [...readFileSync(f, "utf8").matchAll(phone)].some((m) => !/555\D{0,3}01/.test(m[0])))
    .map((f) => f.replace(root, ""));
  assert.deepEqual(bad, []);
});

// SHA-256 of the earlier resume PDF, the one that listed a phone number. Hash only: no number is stored here.
const OLD_RESUME_SHA256 = "ff7c73c67009f84927f3434683440e97dd5b9ca8a7093cf3a620cc30f72f5889";

test("the public resume is the phone-free web version", () => {
  const pdf = readFileSync(join(root, "public/Sai_Tarun_Reddy_Lankireddy_Resume.pdf"));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.notEqual(
    createHash("sha256").update(pdf).digest("hex"),
    OLD_RESUME_SHA256,
    "the old resume with a phone number is back",
  );
});

// WCAG AA: 4.5:1 for normal text. Read straight from the CSS tokens, for both themes and every surface.
const css = readFileSync(join(root, "app/globals.css"), "utf8");
const tokens = (block) =>
  Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const lightTokens = tokens(css.slice(css.indexOf(":root {"), css.indexOf(':root[data-theme="dark"]')));
const darkTokens = tokens(css.slice(css.indexOf(':root[data-theme="dark"]'), css.indexOf("@theme")));
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("contrast: text tokens meet AA on every surface in both themes", () => {
  const surfaces = ["bg", "tile-bg", "row-active", "btn-bg"];
  const rules = {
    text: surfaces,
    body: surfaces,
    muted: surfaces,
    faint: surfaces,
    "green-ink": surfaces,
    red: ["bg", "tile-bg"],
  };
  const failures = [];
  for (const [theme, t] of [
    ["light", lightTokens],
    ["dark", darkTokens],
  ]) {
    for (const [fg, onto] of Object.entries(rules)) {
      for (const bg of onto) {
        const r = ratio(t[fg], t[bg]);
        if (r < 4.5) failures.push(`${theme}: ${fg} ${t[fg]} on ${bg} ${t[bg]} = ${r.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("published measurements meet the bar they are shown against", () => {
  const lh = JSON.parse(readFileSync(join(root, "content/lighthouse.json"), "utf8"));
  const ev = JSON.parse(readFileSync(join(root, "content/ask-eval.json"), "utf8"));
  if (lh.ranAt)
    for (const [k, v] of Object.entries(lh.lowest)) assert.ok(v >= 95, `Lighthouse ${k} is ${v}, below 95`);
  if (ev.ranAt) {
    assert.ok(ev.results.length >= 25);
    assert.deepEqual(
      ev.results.filter((r) => !r.passed).map((r) => r.id),
      [],
      "a recorded Ask test failed",
    );
  }
});

test("security headers: the set is complete, and the CSP only allows this site's own origin", () => {
  const prod = Object.fromEntries(buildSecurityHeaders(true).map((x) => [x.key, x.value]));
  for (const k of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
    "Content-Security-Policy",
  ]) {
    assert.ok(prod[k], `${k} missing`);
  }
  assert.equal(prod["X-Content-Type-Options"], "nosniff");
  assert.equal(prod["X-Frame-Options"], "DENY");
  // No third-party origin anywhere in the policy, and no eval.
  assert.ok(!/https?:\/\//.test(csp), "the CSP names an external origin");
  assert.ok(!/unsafe-eval/.test(csp), "unsafe-eval is not allowed");
  for (const d of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ]) {
    assert.ok(csp.includes(d), `${d} missing`);
  }
  const dev = buildSecurityHeaders(false).map((x) => x.key);
  assert.ok(!dev.includes("Content-Security-Policy"), "the dev server must not get the production CSP");
});
