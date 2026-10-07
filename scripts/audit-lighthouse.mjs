// Lighthouse on the production build: home page and every case study, mobile profile (Lighthouse's default,
// simulated slow 4G). Writes content/lighthouse.json with the lowest score per category, which the colophon shows.
// Needs a build first (`npm run build`) and Chrome (CHROME_PATH, or the macOS default). Run: npm run audit:lighthouse
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { caseStudies } from "../content/case-studies";

const LIGHTHOUSE = "lighthouse@12.8.2"; // pinned so scores are comparable between runs
const PORT = 3199;
const chrome =
  process.env.CHROME_PATH ??
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
if (!chrome) {
  console.error("Chrome not found. Set CHROME_PATH.");
  process.exit(1);
}
if (!existsSync(new URL("../.next/BUILD_ID", import.meta.url))) {
  console.error("No production build found. Run `npm run build` first.");
  process.exit(1);
}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore", detached: false });
const stop = () => server.kill();
process.on("exit", stop);

async function ready() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
}

await ready();
const dir = mkdtempSync(join(tmpdir(), "lh-"));
const pages = [{ name: "Home", path: "/" }, ...caseStudies.map((c) => ({ name: c.shortName, path: `/work/${c.slug}` }))];
const results = [];

for (const [i, page] of pages.entries()) {
  const out = join(dir, `${i}.json`);
  const run = spawnSync(
    "npx",
    ["--yes", LIGHTHOUSE, `http://localhost:${PORT}${page.path}`, "--quiet", "--output=json", `--output-path=${out}`, `--chrome-flags=--headless=new --no-sandbox`],
    { env: { ...process.env, CHROME_PATH: chrome }, encoding: "utf8" },
  );
  if (run.status !== 0 || !existsSync(out)) {
    console.error(`Lighthouse failed on ${page.path}\n${run.stderr}`);
    stop();
    process.exit(1);
  }
  const lh = JSON.parse(readFileSync(out, "utf8"));
  const score = (id) => Math.round(lh.categories[id].score * 100);
  const r = {
    page: page.name,
    path: page.path,
    performance: score("performance"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    seo: score("seo"),
    lcpSeconds: +(lh.audits["largest-contentful-paint"].numericValue / 1000).toFixed(1),
  };
  results.push({ ...r, version: lh.lighthouseVersion });
  console.log(`${r.page.padEnd(16)} perf ${r.performance}  a11y ${r.accessibility}  best-practices ${r.bestPractices}  seo ${r.seo}  (LCP ${r.lcpSeconds}s)`);
}
stop();

const lowest = (key) => Math.min(...results.map((r) => r[key]));
const record = {
  ranAt: new Date().toISOString(),
  tool: `Lighthouse ${results[0].version}`,
  profile: "mobile, simulated slow 4G, production build",
  lowest: {
    performance: lowest("performance"),
    accessibility: lowest("accessibility"),
    bestPractices: lowest("bestPractices"),
    seo: lowest("seo"),
  },
  pages: results.map((r) => ({ page: r.page, path: r.path, performance: r.performance, accessibility: r.accessibility, bestPractices: r.bestPractices, seo: r.seo, lcpSeconds: r.lcpSeconds })),
};
writeFileSync(new URL("../content/lighthouse.json", import.meta.url), `${JSON.stringify(record, null, 2)}\n`);
console.log("\nLowest across pages:", record.lowest, "\nWrote content/lighthouse.json");
process.exit(Object.values(record.lowest).every((v) => v >= 95) ? 0 : 2);
