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
3. **Write the article** following the style, structure, and visuals sections below, and save it to `public/content/articles/{slug}.md`.
4. **Wire it into the site** by following [references/site-integration.md](references/site-integration.md): one metadata entry and the images.
5. **Run the checklist** at the end of this file.

## When a GitHub repository is provided

The repository is evidence for the article, not its subject. Readers should come away understanding the reasoning, and be able to follow the article without ever opening the repo.

1. Inspect the repository: structure, README, and code.
2. Infer the architectural approach, the problem the project demonstrates, and the intentional trade-offs.
3. Use selective, minimal code excerpts inspired by the repo.
4. Embed the GitHub link where it adds context, for example:

```markdown
<!-- Near the end of the introduction or after the mental model shift -->
The complete implementation is available on [GitHub](https://github.com/user/repo) — but this article will walk you through the reasoning that shaped it.

<!-- Or in the "What This Looks Like in Practice" section -->
You can explore the full implementation in the [companion repository](https://github.com/user/repo). Here, I'll highlight the decisions that matter most.

<!-- Or in the closing takeaway -->
Clone the [reference implementation](https://github.com/user/repo) and trace through it yourself.
```

## Writing style

The audience is senior engineers, tech leads, and architects. They already know the fundamentals and read Devocrazia for judgement, not instructions.

- Opinionated, pragmatic, experience-driven
- Not a tutorial: focus on reasoning and consequences, not syntax
- No buzzwords without substance
- Short paragraphs, sharp transitions

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

## Visuals and media

Visuals are a large part of what makes Devocrazia articles readable, so every article needs its own custom visuals in the same visual language as the existing ones. Prefer abstract diagrams over literal UI screenshots, and make each visual explain something the text doesn't already say.

**Hero image** (top of the article and social media preview): dark background, minimalist, technical or architectural mood, abstract representations (flows, nodes, boundaries, streams, layers), no text-heavy overlays, serious engineering-first tone. Include a `[HERO IMAGE]` block with a detailed description for generation.

**Preview image** (article cards): same visual language as the hero, but a simpler composition built around one strong concept, readable at small sizes. Include a `[PREVIEW IMAGE]` block with a detailed description for generation.

**Article GIFs**: 1-3 animated GIFs that visualise flows, state changes, architecture evolution, or cause and effect, for example a request -> domain -> infrastructure flow, state transitions over time, before vs after an architectural change, or event propagation. Use the same palette, keep them clean and minimal, with no stock imagery or emojis. Include `[GIF: description]` blocks inline, at the point where each one should appear.

## Things to avoid

- **Explaining fundamentals.** The audience already knows them, and it dilutes the opinion.
- **Referring to how the article was produced** (AI, prompts, tooling). The article should read as the author's own experience. Writing *about* AI as a topic is fine.
- **Repeating the GitHub README.** Readers can read it themselves; the article adds the reasoning.
- **Overusing code.** Long listings bury the argument; keep snippets focused.
- **Hedging opinions.** A clear position the reader can disagree with is more useful than a balanced summary.

## Checklist

- [ ] Article saved at `public/content/articles/{slug}.md`
- [ ] `[HERO IMAGE]` and `[PREVIEW IMAGE]` description blocks included
- [ ] 1-3 `[GIF]` descriptions with placement hints included
- [ ] GitHub link embedded organically (if repo provided)
- [ ] All code blocks have language hints
- [ ] Internal links use relative paths (`/articles/...`)
- [ ] Every step in [references/site-integration.md](references/site-integration.md) done
- [ ] `npm run build && npm test` passes
