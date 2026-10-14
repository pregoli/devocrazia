---
name: devocrazia-article-author
description: Writes new Devocrazia blog articles (opinionated, senior-level software engineering pieces) in the house tone, structure, and visual style, and wires them into the site metadata. Use when the user wants to write, draft, or create a new article or blog post for Devocrazia, optionally based on a GitHub repository. Make sure to use this skill whenever the user mentions a new Devocrazia article, a blog post about an architecture or engineering topic, or turning a repo into an article, even if they don't say "Devocrazia" explicitly.
---

# Devocrazia Article Author

Write opinionated, senior-level software engineering articles grounded in real production experience, matching the tone, structure, and visual style of the existing articles in `public/content/articles/`.

Before writing, skim one or two existing articles (for example `rich-domain-modelling-escape-anaemic-models.md`) to calibrate tone and length. Consistency across the publication matters more than any individual stylistic choice.

## Workflow

1. **Gather input**: a topic (required) and optionally a GitHub repository URL.
2. **If there's a repo, study it** (see below).
3. **Interview the author** (see below).
4. **Write the article** following the style and structure sections below, and save it to `public/content/articles/{slug}.md`.
5. **Humanize the draft** (see below).
6. **Draw the visuals** (see below).
7. **Wire it into the site** by following [references/site-integration.md](references/site-integration.md).
8. **Run the checklist** at the end of this file.

## When a GitHub repository is provided

The repository is evidence for the article, not its subject. Readers should come away understanding the reasoning, and be able to follow the article without ever opening the repo.

1. Inspect the repository: structure, README, and code.
2. Infer the architectural approach, the problem the project demonstrates, and the intentional trade-offs.
3. Use selective, minimal code excerpts inspired by the repo.
4. Embed the GitHub link where it adds context, for example:

```markdown
<!-- Near the end of the introduction or after the mental model shift -->
The complete implementation is available on [GitHub](https://github.com/user/repo), but this article will walk you through the reasoning that shaped it.

<!-- Or in the "What This Looks Like in Practice" section -->
You can explore the full implementation in the [companion repository](https://github.com/user/repo). Here, I'll highlight the decisions that matter most.

<!-- Or in the closing takeaway -->
Clone the [reference implementation](https://github.com/user/repo) and trace through it yourself.
```

## Interviewing the author

Call the Skill tool with "grilling" before writing anything. A topic alone gives you the subject, not the author's position, and the position is what a Devocrazia article is for. The facts (what the repo does, what the existing articles already cover) are yours to look up; the opinions are the author's.

Cover at least these branches of the design tree, in whatever order the frontier allows:

- **The thesis**: the one opinion the article argues, phrased so a reader could disagree with it.
- **The pain**: the production story behind it. What broke, what it cost, what the team tried first.
- **The obvious approach**: what most teams do instead, and exactly where it falls over.
- **The trade-offs**: when the author's approach is the wrong call, and what it costs even when it's right.
- **The reader**: what they already know walking in, so the article skips it.
- **The repo's role** (if there is one): which decisions in it are worth showing, and which are incidental.
- **Placement**: title, slug, category, and tags, checked against the existing articles so it doesn't repeat one.

Write the article only once the author confirms you share an understanding. Skip the interview only if the author explicitly asks for a draft without one.

## Humanizing the draft

Run the `humanizer` skill in file mode on `public/content/articles/{slug}.md`. A draft written in one pass picks up AI writing habits (staged "not X but Y" contrasts, one-line closers, forced triads, inflated words), and readers of a publication built on the author's own experience notice them.

- Give it one published article as the voice sample, for example `rich-domain-modelling-escape-anaemic-models.md`, so it matches the author's sentence length and rhythm instead of a generic neutral voice.
- Apply its prose patterns (sections A, B, C, and E), but keep the Devocrazia formatting conventions it would otherwise flag in section D: Title Case headings, `---` dividers between sections, and `**Label**: explanation` list items where the label carries information. Every published article uses them, and the publication should look consistent.
- Keep the article's opinions and its 7-part structure. Humanizer may cut a sentence that only restates the point, but not a claim, a trade-off, or a code example.

## Writing style

The audience is senior engineers, tech leads, and architects. They already know the fundamentals and read Devocrazia for judgement, not instructions.

- Opinionated, pragmatic, experience-driven
- Not a tutorial: focus on reasoning and consequences, not syntax
- No buzzwords without substance
- Short paragraphs, sharp transitions
- No em dashes (—). Use a comma, colon, parentheses, or a new sentence instead. It is the author's house style (heavy em dash use reads as machine-written), and `npm run build` fails if an em dash appears in any article markdown file or in `src/data/articles.ts`.

**Tone reference:**
> "This is what you only realise after shipping this to production."

## Article structure

Every Devocrazia article follows this arc. Readers expect it, and it keeps the focus on the decision rather than the technology.

1. **Strong opening statement**: bold, slightly provocative, grounded in real engineering pain.
2. **Why the obvious approach fails**: the common solution and why it breaks at scale or over time.
3. **The mental model shift**: the core idea or principle that reframes the problem.
4. **What this looks like in practice**: concrete implementation insights and focused code snippets (from the repo if available). Explain why, not how.
5. **Trade-offs and constraints**: explicit costs, limitations, and misuse scenarios.
6. **Production reality check**: impact on maintainability, debugging, team velocity, and long-term change.
7. **Closing takeaway**: one strong opinion the reader should act on.

## Visuals

Diagrams are a large part of what makes Devocrazia articles readable, and the build fails without the hero and preview images, so write every visual yourself as SVG code. Pick a short `{topic}` name for the article's images (for example `saga-pattern` for `mastering-saga-pattern-distributed-transactions-dotnet`); existing images use one rather than the full slug.

Before drawing, open the hero, preview, and diagrams of one existing article (for example `public/images/saga-pattern-*.svg` and `public/images/articles/saga-pattern/`) and match their visual language:

- **Background**: dark slate gradient from `#0f172a` to `#1e293b`.
- **Accents**: cyan `#06b6d4`, emerald `#10b981`, violet `#8b5cf6`, amber `#f59e0b`, and red `#ef4444` for failure paths. Muted text in `#94a3b8` and `#64748b`.
- **Type**: `system-ui, -apple-system, sans-serif` for labels, `monospace` for code names. No web fonts, external images, or links: the SVGs are also rendered standalone to PNG.
- **Shapes**: rounded boxes, dashed connectors, small arrowheads. Abstract diagrams, not UI screenshots.

The files:

- **Hero**, `public/images/{topic}-hero.svg`, viewBox `0 0 1200 630`: the top of the article and its social preview card. Title and subtitle at the top, one or two diagrams of the core idea, a row of technology badges, and a one-line tagline at the bottom.
- **Hero PNG**, `public/images/{topic}-hero.png`: social crawlers don't render SVG. Render it from the hero with `node .claude/skills/devocrazia-medium-publish/scripts/svg-to-png.mjs --width 1200 --out-dir public/images public/images/{topic}-hero.svg`.
- **Preview**, `public/images/{topic}-preview.svg`, viewBox `0 0 400 400`: the article card. A short title, one concept diagram, and badges, readable at card size.
- **Diagrams**, `public/images/articles/{topic}/{name}.svg`, about 800 wide: 3-7 per article, each placed where it explains something the text doesn't, as `![Alt text](/images/articles/{topic}/{name}.svg)`.

Then look at what you drew: render every SVG to a scratch folder with the same script (`--out-dir /tmp/{topic}-check`) and read the PNGs. Overflowing text, overlapping boxes, and clipped labels are invisible in SVG code. Fix them and render again until each image is clean.

## Things to avoid

- **Explaining fundamentals.** The audience already knows them, and it dilutes the opinion.
- **Referring to how the article was produced** (AI, prompts, tooling). The article should read as the author's own experience. Writing *about* AI as a topic is fine.
- **Repeating the GitHub README.** Readers can read it themselves; the article adds the reasoning.
- **Overusing code.** Long listings bury the argument; keep snippets focused.
- **Hedging opinions.** A clear position the reader can disagree with is more useful than a balanced summary.

## Checklist

- [ ] Article saved at `public/content/articles/{slug}.md`
- [ ] Interview done, and the article argues the thesis the author confirmed
- [ ] Hero SVG and PNG (1200x630), preview SVG (400x400), and 3-7 diagrams drawn, rendered, and checked by eye
- [ ] GitHub link embedded organically (if repo provided)
- [ ] All code blocks have language hints
- [ ] No em dashes anywhere in the article or its metadata
- [ ] Humanizer pass done, with house formatting kept
- [ ] Internal links use relative paths (`/articles/...`)
- [ ] Every step in [references/site-integration.md](references/site-integration.md) done
- [ ] `npm run build && npm test` passes
