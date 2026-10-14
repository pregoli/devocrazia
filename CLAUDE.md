# CLAUDE.md

Devocrazia is a personal software-engineering blog (devocrazia.com). React 18 + TypeScript SPA built with Vite, styled with Tailwind + shadcn/ui, articles rendered from Markdown with `react-markdown`. Hosted on Cloudflare Pages.

## Git workflow — NEVER push to `main`

- **Never commit or push directly to `main`.** Always work on a branch (`feature/<name>` or `article/<slug>`) and open a PR.
- PRs are squash-merged; the PR title becomes the commit message.
- CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run build`, and `npm test` on Node 20 for every PR to `main`.
- Merging to `main` auto-deploys to production via Cloudflare Pages — there is no staging.

## Commands

```bash
npm run dev       # dev server on http://localhost:8080
npm run build     # vite build + scripts/prerender.js (writes dist/)
npm run lint      # eslint
npm test          # Playwright e2e (chromium) against `npm run preview` on :4173
```

`npm test` serves the **built** `dist/` via `vite preview`, not the dev server. Always run `npm run build` before `npm test`, otherwise tests run against stale output.

## Adding or editing an article

Article data is duplicated across several files with nothing enforcing consistency. Keep all of these in sync:

1. `public/content/articles/{slug}.md` — article body (fetched at runtime by `src/pages/ArticleDetail.tsx`).
2. `src/data/articles.ts` — metadata used by the app. `id` is sequential starting at 0; use the next unused number.
3. `scripts/prerender.js` — hand-maintained copy of the metadata used to generate per-article static HTML with Open Graph/Twitter meta tags. Here `heroImage` must point to the **`.png`** (social crawlers don't render SVG), whereas `src/data/articles.ts` uses the `.svg`.
4. `public/sitemap.xml` — add a `<url>` entry for `/articles/{slug}`.
5. Images:
   - `public/images/{slug}-hero.svg` + `{slug}-hero.png` (1200x630)
   - `public/images/{slug}-preview.svg`
   - diagrams in `public/images/articles/{topic}/`

Medium versions live alongside the original as `{slug}.medium.md`, with PNG diagrams under `public/images/articles/{topic}/medium/`.

Project skills in `.claude/skills/`:
- `devocrazia-article-author` — writing new articles in the Devocrazia style.
- `devocrazia-medium-publish` — adapting an existing article for Medium.

## Architecture notes

- Routes are defined in `src/App.tsx` (`/`, `/about`, `/articles`, `/articles/:slug`, `/contact`, `/privacy`, `/thank-you`).
- `public/_redirects` provides the SPA fallback (`/* /index.html 200`) and www → apex redirect. Do not add trailing-slash redirects — they caused redirect loops before.
- `scripts/prerender.js` writes `dist/articles/{slug}/index.html` and static-page HTML so link previews show the correct meta tags; the SPA takes over after load.
- `src/components/ui/` is generated shadcn/ui code — add components with the shadcn CLI (`components.json`) rather than hand-writing them, and avoid editing them unless necessary.
- Import alias `@/` → `src/`.
- Contact form posts to Web3Forms (`src/pages/Contact.tsx`) and redirects to `/thank-you`; comments use Giscus (`src/components/Giscus.tsx`).
- E2E tests live in `e2e/`. Add or update tests when changing navigation or the contact flow.
