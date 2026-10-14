# CLAUDE.md

Devocrazia is a personal software-engineering blog (devocrazia.com). React 18 + TypeScript SPA built with Vite, styled with Tailwind + shadcn/ui, articles rendered from Markdown with `react-markdown`. Hosted on Cloudflare Pages.

## Git workflow: NEVER push to `main`

- **Never commit or push directly to `main`.** Always work on a branch (`feature/<name>` or `article/<slug>`) and open a PR.
- PRs are squash-merged; the PR title becomes the commit message.
- **Never use em dashes (—)** in PR titles, PR bodies, commit messages, or review replies, just as in articles (see below). Nothing checks these automatically, so check before every `git commit` and `gh pr create`.
- CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run lint`, `npm run build`, and `npm test` on the Node version in `.node-version` for every PR to `main`.
- The `main` ruleset requires a PR, squash merges, and the `Lint, build, test` check (job `test` in the `CI` workflow; the ruleset matches the job's display name, so rename both together); no approval (authors can't approve their own PRs). PRs that only touch `.claude/**`, `CLAUDE.md`, or `README.md` skip that job's steps, and the skipped job still counts as passed. Don't reintroduce `paths-ignore`: a workflow that never starts never reports the check, and the PR waits forever.
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
   - `public/images/{topic}-hero.svg` + `{topic}-hero.png` (1200x630), where `{topic}` is a short image name like `saga-pattern`. The PNG is used for social previews, because crawlers don't render SVG; its path is derived from `heroImage`.
   - `public/images/{topic}-preview.svg`
   - diagrams in `public/images/articles/{topic}/`

`npm run build` fails if an article's markdown file or images are missing, or if a slug or id is duplicated. Don't hand-edit a sitemap: it is generated into `dist/sitemap.xml`.

**Never use em dashes (—) in articles.** That covers every `.md` file in `public/content/articles/` (including Medium versions) and the metadata in `articles.ts`. Use a comma, colon, parentheses, or a new sentence instead. The build fails and lists each occurrence.

Medium versions live alongside the original as `{slug}.medium.md`, with PNG diagrams under `public/images/articles/{topic}/medium/`.

Project skills in `.claude/skills/`:
- `devocrazia-article-author`: writing new articles in the Devocrazia style. It interviews the author with `grilling` first, and draws the SVGs itself.
- `devocrazia-medium-publish`: adapting an existing article for Medium.
- `humanizer`: removes AI writing patterns from prose. Both article skills run it on their drafts.
- `grilling` / `grill-me`: interviews the user about a plan until nothing is left assumed. `/grill-me` runs it on demand, for example before a site change.
- `pr`: the shape of a PR body (summary visual, evidence, merge danger).

`humanizer`, `grilling`, `grill-me`, and `pr` are pinned third-party copies (see each `UPSTREAM.md`), so don't edit their `SKILL.md`.

## Architecture notes

- Routes are defined in `src/App.tsx` (`/`, `/about`, `/articles`, `/articles/:slug`, `/contact`, `/privacy`, `/thank-you`).
- `public/_redirects` provides the SPA fallback (`/* /index.html 200`) and www → apex redirect. Do not add trailing-slash redirects; they caused redirect loops before.
- `scripts/prerender.js` imports `src/data/articles.ts` and `src/lib/site.ts` directly (Node type stripping, hence Node 22, pinned in `.node-version`) and writes `dist/articles/{slug}/index.html`, static-page HTML, and `dist/sitemap.xml`, so link previews show the correct meta tags; the SPA takes over after load. Keep both files free of imports and non-erasable TypeScript (enums, namespaces) so Node can load them.
- Head tags (title, description, canonical, Open Graph, Twitter) are defined once in `src/lib/site.ts`: `staticPageMeta()`, `articlePageMeta()`, or `noindexPageMeta()` for pages that shouldn't be indexed. `scripts/prerender.js` renders them to HTML for crawlers that don't run JavaScript, and every page passes them to `Layout` as `meta`, which renders them with Helmet. Prerendered tags carry Helmet's `data-react-helmet` marker, so Helmet replaces them instead of adding duplicates; don't render SEO tags in a separate `<Helmet>`. Static page titles and descriptions live in `staticPages` in the same file.
- Canonical and `og:url` come from `canonicalUrl()`: always the production host, always with a trailing slash, because Cloudflare 308-redirects bare paths to it. The "SEO tags" e2e tests check that every page, including after client-side navigation, has exactly one correct canonical.
- `src/components/ui/` is generated shadcn/ui code. Add components with the shadcn CLI (`components.json`) rather than hand-writing them, and avoid editing them unless necessary.
- Import alias `@/` → `src/`.
- Contact form posts to Web3Forms (`src/pages/Contact.tsx`) and redirects to `/thank-you`; comments use Giscus (`src/components/Giscus.tsx`).
- E2E tests live in `e2e/`. Add or update tests when changing navigation or the contact flow.

## Agent skills

`/to-spec` and `/to-tickets` turn a planning conversation (usually after `/grill-me`) into GitHub issues: a spec, then small tickets that each list what blocks them. They are pinned copies from mattpocock/skills, like `setup-matt-pocock-skills`, which wrote the files below; don't edit their `SKILL.md`.

### Issue tracker

Issues and specs live in GitHub Issues, used through `gh`. To implement one, branch and open a PR with `Closes #N`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`); the skills apply `ready-for-agent`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: a root `GLOSSARY.md` and `docs/adr/`, neither of which exists yet. See `docs/agents/domain.md`.
