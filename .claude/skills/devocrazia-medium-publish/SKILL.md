---
name: devocrazia-medium-publish
description: Adapts an existing Devocrazia article into a condensed, Medium-ready version with a curiosity-hook title, PNG diagrams, and a publishing checklist. Use when the user wants to publish, cross-post, transform, or convert a Devocrazia article for Medium. Make sure to use this skill whenever the user mentions Medium, a Medium version of an article, cross-posting, or syndicating a Devocrazia post, even if they only give the article slug or title.
---

# Devocrazia to Medium

Transform a Devocrazia article into a Medium-optimised version with condensed content, adapted tone, and publication-ready assets.

## Why the Medium version is different

| Devocrazia | Medium |
|------------|--------|
| Deep-dive, comprehensive | Focused, scannable |
| Study material | Quick insight |
| All the details | Core concepts only |
| 2000-4000 words | 1000-2000 words |
| Exhaustive code examples | Illustrative snippets |

So the Medium version is a condensed adaptation, not a reformatted copy. Its job is to deliver the core insight and send readers who want the depth back to Devocrazia.

For a finished example, see `public/content/articles/building-bank-atm-event-sourcing-cqrs-dotnet.medium.md` and its images in `public/images/articles/event-sourcing/medium/`.

## Workflow

### 1. Analyse the source

1. Read the source article from `public/content/articles/{slug}.md`.
2. Identify the sections to keep (the core value proposition) and the ones to cut.
3. Locate the article's images. They live in a topic-named folder under `public/images/articles/` (for example `event-sourcing/`), not necessarily the slug, so use the paths referenced in the article.

### 2. Adapt the content

This is the main work.

**Keep:** the opening hook, the core problem or anti-pattern, the mental model shift, one or two key code examples, condensed trade-offs, and the closing takeaway.

**Cut:** exhaustive implementation details, advanced patterns (Specification, Domain Services, etc.), multiple variations of the same concept, deep infrastructure or persistence sections, and code blocks longer than about 30 lines.

**Rules:**
- Aim for roughly 50% of the original length.
- Keep at most 3-4 code blocks, choosing the most illustrative.
- Tighten prose: remove hedging and redundant explanations.
- Focus on why; reduce how. One strong opinion per section.
- No em dashes (—), the same house style as the source articles: use a comma, colon, parentheses, or a new sentence. `npm run build` checks `.medium.md` files too and fails on any em dash.

**Complex topics need more, not less.** For Event Sourcing, CQRS, the Saga Pattern, or distributed systems, aggressive cuts make the article incomprehensible. Use all relevant diagrams (they carry most of the understanding), give each architectural concept its diagram, keep the explanatory sections, and treat 50% as a guideline. The goal is a *focused* article, not a *stripped* one: if a reader can't understand the pattern after reading, too much was cut.

### 3. Write the title and subtitle

Give the title a curiosity hook and keep the tech stack (.NET etc.) in the subtitle. Read [references/titles-and-tags.md](references/titles-and-tags.md) for before/after examples and the reasoning.

### 4. Apply the structural transformations

| Source | Medium |
|--------|--------|
| H1 title | Remove (it becomes the Medium title field) |
| `---` dividers | Remove entirely |
| H2 (`##`) | Demote to H3 (`###`) |
| H3 (`###`) | Demote to H4 (`####`) |
| Relative image paths | Replace with the uploaded image |
| Internal article links (`/articles/...`) | Placeholder: `[LINK: {slug}]` |
| Markdown tables | Convert to bullet lists (Medium has no table support) |

### 5. Generate the PNG images

Medium does not accept SVG, so every diagram the Medium version uses needs a PNG. Run the bundled script from the repo root with all the SVGs the adapted article references:

```bash
node .claude/skills/devocrazia-medium-publish/scripts/svg-to-png.mjs \
  public/images/articles/{topic}/architecture.svg \
  public/images/articles/{topic}/flow.svg
```

It renders each SVG in Playwright's Chromium (so fonts and symbols match the site) at 1400px wide, and writes the PNG to a `medium/` folder next to the source:

```
public/images/articles/{topic}/
├── architecture.svg
└── medium/
    └── architecture.png
```

If Chromium is missing, the script says so; run `npx playwright install chromium` and retry. Check the script's output for any `❌` lines before moving on.

### 6. Write the Medium article

Save it to `public/content/articles/{slug}.medium.md`, ending with a footer that links back to Devocrazia.

If the article has a GitHub repository:
```markdown
{Condensed article content}

---

*I explore these patterns in depth on [Devocrazia](https://devocrazia.com/articles/{slug}/). The full solution is available on [GitHub](https://github.com/...).*
```

If there is no GitHub repository:
```markdown
{Condensed article content}

---

*This article was originally published on [Devocrazia](https://devocrazia.com/articles/{slug}/) with additional implementation details and code examples.*
```

When a repo exists, the footer link is always included. For implementation-heavy articles, also consider early context near the start:
> "The complete implementation is available on [GitHub](https://github.com/...). This article focuses on the reasoning behind it."

This sets expectations: Medium for concepts, GitHub for code, Devocrazia for depth.

### 7. Print the publishing checklist

Fill in [assets/publishing-checklist.md](assets/publishing-checklist.md) and print it to the console so the user can publish manually. Pick tags from the table in [references/titles-and-tags.md](references/titles-and-tags.md).

Always include the canonical URL. It tells search engines that the Devocrazia version is the original, so the cross-post doesn't compete with it.

## Quality checklist

Before finalising, check:

- [ ] Appropriately condensed (~50% for simple topics, more generous for complex patterns)
- [ ] Code blocks are illustrative, not implementation dumps
- [ ] Curiosity-hook title, with the tech stack in the subtitle
- [ ] All PNGs generated in the `medium/` folder, with no `❌` errors from the script
- [ ] Every key concept has a diagram (especially for architectural patterns)
- [ ] No orphaned sections (each section earns its place)
- [ ] Strong opening and closing
- [ ] No em dashes
- [ ] A reader can understand the pattern after reading (the real test)
- [ ] Canonical URL included
