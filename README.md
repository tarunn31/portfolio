# Sai Tarun Reddy Lankireddy, portfolio

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Geist. Content lives in typed files under
`content/`; components only render it. See `DEPLOYMENT.md` to ship it.

A local-only `internal/` folder (git-ignored) holds working files that are not part of the site. Nothing in the build
or the tests depends on it.

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY to try custom Ask questions
npm run dev
```

| Script | What it does |
|---|---|
| `npm run build` / `start` | Production build and server |
| `npm run typecheck`, `npm run lint` | Types and ESLint |
| `npm run test:site` | Palette, SEO, contrast (AA) and the no em dash / no phone number rules |
| `npm run test:ask` | Ask: validator, guards, rate limiter, mocked model failures (no key needed) |
| `npm run verify:chunks` | Every Retrieval tile sentence is verbatim from the section it links to |
| `npm run eval:ask` | Live Ask tests against the real model (needs a key, costs a few cents) |
| `npm run test:browser` | Real Chrome on the production build: reduced motion, touch, Work rows, phone overflow |
| `npm run audit:lighthouse` | Lighthouse on the production build (needs Chrome) |

## Layout

- `app/` routes, `/api/ask`, sitemap, robots, Open Graph images
- `components/` UI, `components/craft/` the four Craft tiles, `components/palette/` the command palette
- `content/` all copy and data, including the Ask knowledge sources
- `lib/ask/` the grounded assistant: sources, prompt, validator, rate limiter, eval cases
- `scripts/` tests, the live eval, the Lighthouse audit, and a small loader so scripts can import the TypeScript
