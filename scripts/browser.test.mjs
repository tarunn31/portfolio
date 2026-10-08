// Browser tests in real Chrome against the production build: the reduced-motion and touch paths, a regression
// for Work rows, and no horizontal overflow on a phone. Needs `npm run build` first and Chrome (CHROME_PATH, or a
// standard install location). Starts its own server unless BASE_URL is set. Run: npm run test:browser
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { caseStudies } from "../content/case-studies";

const PORT = 3198;
const executablePath =
  process.env.CHROME_PATH ??
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
  ].find(existsSync);
if (!executablePath) {
  console.error("Chrome not found. Set CHROME_PATH.");
  process.exit(1);
}

let server;
if (!process.env.BASE_URL) {
  if (!existsSync(new URL("../.next/BUILD_ID", import.meta.url))) {
    console.error("No production build found. Run `npm run build` first.");
    process.exit(1);
  }
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { stdio: "ignore" });
  process.on("exit", () => server.kill());
}
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`;
for (let i = 0; ; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {
    // not up yet
  }
  if (i > 60) throw new Error("server did not start");
  await new Promise((r) => setTimeout(r, 500));
}
const results = [];
const check = (mode, name, ok, detail = "") => {
  results.push({ mode, name, ok: !!ok, detail });
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath, headless: "new", args: ["--no-sandbox"] });

async function open(setup) {
  const page = await browser.newPage();
  const mp4 = [];
  page.on("request", (r) => r.url().endsWith(".mp4") && mp4.push(r.url().split("/").pop()));
  await setup(page);
  await page.goto(BASE + "/", { waitUntil: "load" });
  await sleep(300);
  return { page, mp4 };
}
const layerTransform = (page) =>
  page.evaluate(() => document.querySelector("div.fixed.top-0")?.style.transform || "");
const spotVar = (page) =>
  page.evaluate(() => document.querySelector(".dots-spot")?.style.getPropertyValue("--mx") || "");

// ---------- 0. regression: a row clicked immediately after load must really open ----------
for (const [label, features] of [
  ["full motion", []],
  ["reduced motion", [{ name: "prefers-reduced-motion", value: "reduce" }]],
]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  if (features.length) await page.emulateMediaFeatures(features);
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#work-ai-data-copilot-btn");
  // A click before React has hydrated is ignored by any server-rendered page, so wait for the handlers to exist.
  await page.waitForFunction(() => {
    const b = document.getElementById("work-ai-data-copilot-btn");
    return b && Object.keys(b).some((k) => k.startsWith("__reactProps"));
  });
  // as early as a script can: no hover, no focus, no idle time for the features to arrive
  await page.evaluate(() => document.getElementById("work-ai-data-copilot-btn").click());
  await sleep(1500);
  const r = await page.evaluate(() => {
    const panel = document.getElementById("work-ai-data-copilot-panel");
    return {
      expanded: document.getElementById("work-ai-data-copilot-btn").getAttribute("aria-expanded"),
      height: panel ? Math.round(panel.getBoundingClientRect().height) : -1,
      nitaStillOpen: !!document.getElementById("work-nita-panel"),
    };
  });
  check(
    "regression",
    `${label}: early click opens the row (not stuck at height 0)`,
    r.expanded === "true" && r.height > 100,
    JSON.stringify(r),
  );
  check(
    "regression",
    `${label}: the previously open row closes`,
    r.nitaStillOpen === false,
    JSON.stringify(r),
  );
  await page.close();
}

// ---------- A. desktop control (full motion) ----------
{
  const { page, mp4 } = await open(async (p) => p.setViewport({ width: 1280, height: 800 }));
  const anim = await page.evaluate(
    () => getComputedStyle(document.querySelector("main section")).animationName,
  );
  check("control", "sections fade up on load", anim === "fadein", anim);
  await sleep(3500);
  const playing = await page.evaluate(() => !document.querySelector("video").paused);
  check(
    "control",
    "Nita preview plays once the page is loaded and idle",
    playing && mp4.length > 0,
    `mp4 requests: ${mp4}`,
  );
  await page.evaluate(() => window.scrollTo(0, 700));
  await sleep(200);
  check(
    "control",
    "dot grid drifts with scroll (parallax)",
    (await layerTransform(page)).startsWith("translate3d"),
    await layerTransform(page),
  );
  await page.mouse.move(300, 400);
  await sleep(200);
  check("control", "cursor spotlight follows the mouse", (await spotVar(page)) !== "", await spotVar(page));
  // The row expands as a transition, not a jump: a mid-flight height sits strictly between closed and open.
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(100);
  const frames = await page.evaluate(async () => {
    document.getElementById("work-clinical-rag-btn").click();
    const samples = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 900) {
      await new Promise((r) => requestAnimationFrame(r));
      samples.push(
        Math.round(document.getElementById("work-clinical-rag-panel")?.getBoundingClientRect().height ?? 0),
      );
    }
    return samples;
  });
  const finalH = frames.at(-1);
  const mid = frames.filter((h) => h > 5 && h < finalH - 5).length;
  const mono = frames.every((h, i) => i === 0 || h >= frames[i - 1] - 1);
  check(
    "control",
    "a Work row eases open (several in-between frames, never overshoots)",
    mid >= 4 && mono && Math.max(...frames) <= finalH + 1,
    `${mid} in-between frames, final ${finalH}px, no overshoot: ${mono}`,
  );
  await page.close();
}

// ---------- B. prefers-reduced-motion: reduce ----------
{
  const { page, mp4 } = await open(async (p) => {
    await p.setViewport({ width: 1280, height: 800 });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  });
  const mm = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  check("reduced", "emulation is active", mm);
  const anim = await page.evaluate(
    () => getComputedStyle(document.querySelector("main section")).animationName,
  );
  check("reduced", "no fade-up animation", anim === "none", anim);
  const sb = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  check("reduced", "no smooth scrolling", sb === "auto", sb);
  await sleep(4000);
  const v = await page.evaluate(() => {
    const el = document.querySelector("video");
    return { paused: el.paused, src: el.getAttribute("src"), poster: !!el.getAttribute("poster") };
  });
  check(
    "reduced",
    "preview video never plays, poster only",
    v.paused && v.src === null && v.poster,
    JSON.stringify(v),
  );
  check("reduced", "the mp4 is never even requested", mp4.length === 0, `mp4 requests: ${mp4.length}`);
  await page.evaluate(() => window.scrollTo(0, 700));
  await sleep(200);
  check(
    "reduced",
    "dot grid does not drift",
    (await layerTransform(page)) === "",
    await layerTransform(page),
  );
  await page.mouse.move(300, 400);
  await sleep(200);
  check("reduced", "no cursor spotlight", (await spotVar(page)) === "", await spotVar(page));
  // row toggle is instant: height right after the click already equals the final height
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(100);
  const toggled = await page.evaluate(async () => {
    document.getElementById("work-ai-data-copilot-btn").click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const panel = document.getElementById("work-ai-data-copilot-panel");
    const early = panel ? panel.getBoundingClientRect().height : -1;
    await new Promise((r) => setTimeout(r, 900));
    return { early, final: panel ? panel.getBoundingClientRect().height : -1 };
  });
  check(
    "reduced",
    "Work rows open instantly (no spring)",
    toggled.early > 0 && Math.abs(toggled.early - toggled.final) < 2,
    JSON.stringify(toggled),
  );
  const tdur = await page.evaluate(() => getComputedStyle(document.querySelector("body")).transitionDuration);
  check("reduced", "transitions are off", /^0s/.test(tdur), tdur);
  await page.evaluate(() => document.querySelector('header button[aria-label*="theme"]').click());
  await sleep(100);
  check(
    "reduced",
    "theme toggle still works",
    await page.evaluate(() => ["light", "dark"].includes(document.documentElement.dataset.theme)),
  );
  await page.keyboard.down("Control");
  await page.keyboard.press("k");
  await page.keyboard.up("Control");
  await sleep(600);
  const dlg = await page.evaluate(() => {
    const d = document.querySelector("[role=dialog]");
    return d ? getComputedStyle(d).animationName : null;
  });
  check("reduced", "command palette opens with no animation", dlg === "none", String(dlg));
  await page.close();
}

// ---------- C. touch phone (iPhone-like, real touchscreen) ----------
{
  const { page } = await open(async (p) => {
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await p.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
  });
  const fine = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  check("touch", "device reports no fine pointer", fine === false);
  const swipe = async (x, y1, y2) => {
    await page.touchscreen.touchStart(x, y1);
    for (let i = 1; i <= 8; i++) {
      await page.touchscreen.touchMove(x, y1 + ((y2 - y1) * i) / 8);
      await sleep(16);
    }
    await page.touchscreen.touchEnd();
    await sleep(400);
  };
  await swipe(20, 600, 200);
  const y = await page.evaluate(() => scrollY);
  check("touch", "swipe scrolls the page", y > 100, `scrollY ${Math.round(y)}`);
  check(
    "touch",
    "gentle parallax still runs on touch",
    (await layerTransform(page)).startsWith("translate3d"),
    await layerTransform(page),
  );
  const parked = await spotVar(page);
  check(
    "touch",
    "no cursor spotlight on touch (stays parked off-screen)",
    parked === "" || parked === "-9999px",
    parked,
  );

  // Retrieval tile: drag moves the query; a vertical swipe starting on the tile still scrolls the page
  await page.evaluate(() => document.querySelector("#craft").scrollIntoView({ block: "start" }));
  await sleep(300);
  const tile = await page.evaluate(() => {
    const r = document.querySelector("#craft .h-60").getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const ring = () =>
    page.evaluate(() => {
      const t = document.querySelector("#craft .h-60");
      return [...t.querySelectorAll("span.rounded-full")].find((s) => s.className.includes("border-text"))
        ?.style.left;
    });
  const before = await ring();
  await page.touchscreen.touchStart(tile.x + tile.w * 0.2, tile.y + tile.h * 0.5);
  await page.touchscreen.touchMove(tile.x + tile.w * 0.35, tile.y + tile.h * 0.5);
  await page.touchscreen.touchMove(tile.x + tile.w * 0.8, tile.y + tile.h * 0.5);
  const during = await page.evaluate(
    () => document.querySelector("#craft p[aria-live] a")?.textContent?.slice(0, 40) ?? null,
  );
  await page.touchscreen.touchEnd();
  await sleep(200);
  const after = await ring();
  check("touch", "dragging on the Retrieval tile moves the query", before !== after, `${before} -> ${after}`);
  check("touch", "nearest chunk line appears on touch (a link)", !!during, String(during));
  const sy0 = await page.evaluate(() => scrollY);
  await swipe(tile.x + tile.w * 0.5, tile.y + tile.h * 0.8, tile.y - 150);
  const sy1 = await page.evaluate(() => scrollY);
  check(
    "touch",
    "a vertical swipe starting on the tile still scrolls the page",
    sy1 - sy0 > 80,
    `scrollY ${Math.round(sy0)} -> ${Math.round(sy1)}`,
  );

  // Taps
  const settle = async () => {
    let last = -1;
    for (let i = 0; i < 40; i++) {
      const y = await page.evaluate(() => scrollY);
      if (y === last) return;
      last = y;
      await sleep(120);
    }
  };
  const tap = async (sel) => {
    await settle();
    const el = await page.$(sel);
    await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await settle();
    await el.tap();
    await sleep(450);
  };
  await tap("#work-clinical-rag-btn");
  check(
    "touch",
    "tap opens a Work row",
    await page.evaluate(
      () => document.getElementById("work-clinical-rag-btn").getAttribute("aria-expanded") === "true",
    ),
  );
  await tap("[role=switch]");
  check(
    "touch",
    "tap flips the consent switch",
    await page.evaluate(
      () => document.querySelector("[role=switch]").getAttribute("aria-checked") === "true",
    ),
  );
  const heal0 = await page.evaluate(() => document.querySelector("#craft [role=status]").textContent);
  await tap("#craft .h-60:nth-of-type(1) button, #craft button.min-h-8");
  check(
    "touch",
    "tap runs the self-healing tile",
    await page.evaluate((h) => document.querySelector("#craft [role=status]").textContent !== h, heal0),
  );
  await tap('header button[aria-label*="theme"]');
  check("touch", "tap toggles theme", await page.evaluate(() => !!document.documentElement.dataset.theme));
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(200);
  const palBtn = await page.evaluateHandle(() =>
    [...document.querySelectorAll("header button")].find((b) => b.textContent.includes("⌘K")),
  );
  await palBtn.asElement().tap();
  await sleep(900);
  check(
    "touch",
    "tap opens the command palette",
    await page.evaluate(() => !!document.querySelector("[role=dialog]")),
  );
  await page.touchscreen.tap(8, 8);
  await sleep(300);
  check(
    "touch",
    "tapping outside closes it",
    await page.evaluate(() => !document.querySelector("[role=dialog]")),
  );

  // Touch target sizes (WCAG 2.2 AA asks for 24x24 CSS px, with an exception for links inside sentences)
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("a, button, [role=switch], summary, input")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (getComputedStyle(el).visibility === "hidden") continue;
      const inSentence =
        el.tagName === "A" && el.closest("p, li") && getComputedStyle(el).display === "inline";
      if (inSentence) continue;
      if (Math.min(r.width, r.height) < 24)
        out.push(
          `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 28)}" ${Math.round(r.width)}x${Math.round(r.height)}`,
        );
    }
    return out;
  });
  check("touch", "interactive targets are at least 24x24 px", small.length === 0, small.join("; "));
  await page.close();
}

// ---------- D. phone widths: nothing scrolls sideways ----------
for (const width of [360, 390]) {
  for (const path of ["/", ...caseStudies.map((c) => `/work/${c.slug}`)]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(BASE + path, { waitUntil: "networkidle0" });
    const o = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      wide: [...document.querySelectorAll("main *, header *")]
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 3)
        .map((e) => `${e.tagName}.${String(e.className).slice(0, 30)}`),
    }));
    check(
      "overflow",
      `${width}px ${path}`,
      o.sw <= o.cw,
      `scrollWidth ${o.sw} / ${o.cw} ${o.wide.join(" ")}`,
    );
    await page.close();
  }
}

// ---------- E. security: headers are served, and the CSP never blocks anything the site needs ----------
{
  const pages = ["/", ...caseStudies.map((c) => `/work/${c.slug}`)];
  for (const path of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const problems = [];
    await page.evaluateOnNewDocument(() => {
      window.__csp = [];
      document.addEventListener("securitypolicyviolation", (e) =>
        window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
      );
    });
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text().slice(0, 120)}`));
    page.on(
      "requestfailed",
      (r) => !r.failure()?.errorText.includes("ERR_ABORTED") && problems.push(`failed: ${r.url()}`),
    );
    const res = await page.goto(BASE + path, { waitUntil: "networkidle0" });
    const headers = res.headers();
    // Use the interactive parts so every lazy chunk, font, video and palette path runs under the CSP.
    if (path === "/") {
      await page.evaluate(() => document.getElementById("work-clinical-rag-btn")?.click());
      await sleep(600);
      await page.keyboard.down("Control");
      await page.keyboard.press("k");
      await page.keyboard.up("Control");
      await sleep(700);
      await page.keyboard.press("Escape");
      await sleep(200);
      await page.evaluate(() =>
        document
          .querySelector("[data-ask-chip='1']")
          ?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })),
      );
      await sleep(1200);
    }
    await sleep(2500); // the preview video starts after the page is idle
    const violations = await page.evaluate(() => window.__csp);
    const want = [
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy",
      "permissions-policy",
      "cross-origin-opener-policy",
      "content-security-policy",
    ];
    const missing = want.filter((k) => !headers[k]);
    const prodLike = BASE.startsWith("https://") || process.env.NODE_ENV === "production" || !!server;
    check(
      "security",
      `${path}: security headers present`,
      missing.length === 0 || !prodLike,
      `missing: ${missing.join(", ") || "none"}`,
    );
    check("security", `${path}: no powered-by header`, !headers["x-powered-by"]);
    check("security", `${path}: no CSP violations`, violations.length === 0, violations.join("; "));
    check(
      "security",
      `${path}: no console errors or failed requests`,
      problems.length === 0,
      problems.join("; "),
    );
    await page.close();
  }
  // The policy is enforced, not just present: an outside request from the page must be blocked.
  {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      window.__csp = [];
      document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(e.violatedDirective));
    });
    await page.goto(BASE + "/", { waitUntil: "networkidle0" });
    const blocked = await page.evaluate(async () => {
      const outcomes = {};
      try {
        await fetch("https://example.com/");
        outcomes.connect = "allowed";
      } catch {
        outcomes.connect = "blocked";
      }
      const img = new Image();
      img.src = "https://example.com/pixel.png";
      const script = document.createElement("script");
      script.src = "https://example.com/x.js";
      document.head.appendChild(script);
      await new Promise((r) => setTimeout(r, 800));
      outcomes.violations = window.__csp;
      return outcomes;
    });
    check(
      "security",
      "CSP blocks outside connections, images and scripts",
      blocked.connect === "blocked" &&
        ["connect-src", "img-src", "script-src"].every((d) =>
          blocked.violations.some((v) => v.startsWith(d)),
        ),
      JSON.stringify(blocked),
    );
    await page.close();
  }
  // The API: wrong format and cross-site callers are refused before they cost anything.
  const call = (headers, body = '{"question":"hi"}') =>
    fetch(`${BASE}/api/ask`, { method: "POST", headers, body }).then((r) => r.status);
  check(
    "security",
    "API rejects text/plain (the cross-site no-preflight trick)",
    (await call({ "content-type": "text/plain" })) === 415,
  );
  check(
    "security",
    "API rejects a request from another origin",
    (await call({ "content-type": "application/json", origin: "https://evil.example" })) === 403,
  );
  check(
    "security",
    "API rejects an oversized body",
    (await call({ "content-type": "application/json" }, "x".repeat(5000))) === 413,
  );
  const api = await fetch(`${BASE}/api/ask`, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "{}",
  });
  check(
    "security",
    "API responses are never cached",
    /no-store/.test(api.headers.get("cache-control") ?? ""),
    api.headers.get("cache-control") ?? "",
  );
}

await browser.close();
const width = Math.max(...results.map((r) => r.name.length));
for (const mode of ["regression", "control", "reduced", "touch", "overflow", "security"]) {
  console.log(`\n== ${mode}`);
  for (const r of results.filter((x) => x.mode === mode))
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.detail}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} of ${results.length} passed`);
server?.kill();
process.exit(failed ? 1 : 0);
