# CLAUDE.md

Devocrazia is a personal software-engineering blog (devocrazia.com). React 18 + TypeScript SPA built with Vite, styled with Tailwind + shadcn/ui, articles rendered from Markdown with `react-markdown`. Hosted on Cloudflare Pages.

## Git workflow: NEVER push to `main`

- **Never commit or push directly to `main`.** Always work on a branch (`feature/<name>` or `article/<slug>`) and open a PR.
- PRs are squash-merged; the PR title becomes the commit message.
- **Never use em dashes (—)** in PR titles, PR bodies, commit messages, or review replies, just as in articles (see below). Nothing checks these automatically, so check before every `git commit` and `gh pr create`.
- CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm run build`, and `npm test` on the Node version in `.node-version` for every PR to `main`.
- Merging to `main` auto-deploys to production via Cloudflare Pages. There is no staging.

## Commands

```bash
npm run dev       # dev server on http://localhost:8080
npm run build     # vite build + scripts/prerender.js (writes dist/, incl. sitemap.xml)
npm run lint      # eslint
npm test          # Playwright e2e (chromium) against `npm run preview` on :4173
```

`npm test` serves the **built** `dist/` via `vite preview`, not the dev server. Always run `npm run build` before `npm test`, otherwise tests run against stale output.

## Adding or editing an article

`src/data/articles.ts` is the single source of truth for article metadata. The app, the prerendered social-preview pages, and `sitemap.xml` are all generated from it. An article needs:

1. `public/content/articles/{slug}.md`: article body (fetched at runtime by `src/pages/ArticleDetail.tsx`).
2. An entry in `src/data/articles.ts`. `id` is sequential starting at 0; use the next unused number.
3. Images:
   - `public/images/{slug}-hero.svg` + `{slug}-hero.png` (1200x630). The PNG is used for social previews, because crawlers don't render SVG; its path is derived from `heroImage`.
   - `public/images/{slug}-preview.svg`
   - diagrams in `public/images/articles/{topic}/`

`npm run build` fails if an article's markdown file or images are missing, or if a slug or id is duplicated. Don't hand-edit a sitemap: it is generated into `dist/sitemap.xml`.

**Never use em dashes (—) in articles.** That covers every `.md` file in `public/content/articles/` (including Medium versions) and the metadata in `articles.ts`. Use a comma, colon, parentheses, or a new sentence instead. The build fails and lists each occurrence.

Medium versions live alongside the original as `{slug}.medium.md`, with PNG diagrams under `public/images/articles/{topic}/medium/`.

Project skills in `.claude/skills/`:
- `devocrazia-article-author`: writing new articles in the Devocrazia style.
- `devocrazia-medium-publish`: adapting an existing article for Medium.

## Architecture notes

- Routes are defined in `src/App.tsx` (`/`, `/about`, `/articles`, `/articles/:slug`, `/contact`, `/privacy`, `/thank-you`).
- `public/_redirects` provides the SPA fallback (`/* /index.html 200`) and www → apex redirect. Do not add trailing-slash redirects; they caused redirect loops before.
- `scripts/prerender.js` imports `src/data/articles.ts` directly (Node type stripping, hence Node 22, pinned in `.node-version`) and writes `dist/articles/{slug}/index.html`, static-page HTML, and `dist/sitemap.xml`, so link previews show the correct meta tags; the SPA takes over after load. Keep `articles.ts` free of imports and non-erasable TypeScript (enums, namespaces) so Node can load it.
- `src/components/ui/` is generated shadcn/ui code. Add components with the shadcn CLI (`components.json`) rather than hand-writing them, and avoid editing them unless necessary.
- Import alias `@/` → `src/`.
- Contact form posts to Web3Forms (`src/pages/Contact.tsx`) and redirects to `/thank-you`; comments use Giscus (`src/components/Giscus.tsx`).
- E2E tests live in `e2e/`. Add or update tests when changing navigation or the contact flow.
