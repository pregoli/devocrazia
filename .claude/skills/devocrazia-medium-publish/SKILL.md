# Devocrazia to Medium Publishing Skill

Transform Devocrazia articles into Medium-optimised versions with condensed content, adapted tone, and publication-ready assets.

## Trigger

Invoke when user says:
- "publish to medium"
- "transform for medium"
- "medium version"
- "convert to medium"
- "/medium-transform"

---

## Philosophy

Medium readers and Devocrazia readers are different audiences:

| Devocrazia | Medium |
|------------|--------|
| Deep-dive, comprehensive | Focused, scannable |
| Study material | Quick insight |
| All the details | Core concepts only |
| 2000-4000 words | 1000-2000 words |
| Exhaustive code examples | Illustrative snippets |

**The Medium version is NOT a reformatted copy. It's a condensed adaptation.**

---

## Workflow

### Phase 1: Content Analysis

1. **Read the source article** from `public/content/articles/{slug}.md`
2. **Identify sections to KEEP** (core value proposition)
3. **Identify sections to CUT** (deep-dives, exhaustive examples, advanced patterns)
4. **Locate images** in `public/images/articles/{slug}/`

### Phase 2: Content Adaptation (THE MAIN WORK)

#### What to Keep
- Strong opening hook
- The core problem/anti-pattern
- The mental model shift
- One or two key code examples
- Trade-offs (condensed)
- Strong closing takeaway

#### What to Cut
- Exhaustive implementation details
- Advanced patterns (Specification, Domain Services, etc.)
- Multiple variations of the same concept
- Deep infrastructure/persistence sections
- Lengthy code blocks (>30 lines)

#### Content Rules
- **Target ~50% of original length** (but see Complexity Consideration below)
- **Maximum 3-4 code blocks** (keep the most illustrative)
- **Tighten prose** - remove hedging, cut redundant explanations
- **Focus on "why"** - reduce "how" details
- **One strong opinion per section**

#### Complexity Consideration (IMPORTANT)

**Complex patterns require more, not less, to be comprehensible.**

For topics like Event Sourcing, CQRS, Saga Pattern, or distributed systems:
- **Use ALL relevant diagrams** - visuals are essential for understanding
- **Don't over-condense** - 50% is a guideline, not a hard rule
- **Keep explanatory sections** - the mental model matters more than brevity
- **Each architectural concept needs its diagram**

The goal is a *focused* article, not a *stripped* one. A reader should understand the pattern after reading - if aggressive cuts make that impossible, you've cut too much.

### Phase 3: Title & Subtitle

Medium titles need curiosity hooks. Transform descriptive titles:

| Original (Devocrazia) | Medium Version |
|-----------------------|----------------|
| "Rich Domain Modelling: Escaping the Anaemic Model Trap" | "Rich Domain Modelling: Why Your Objects Should Own Their Behaviour" |
| "Building a Bank ATM System with Event Sourcing and CQRS in .NET 9" | "Event Sourcing: Why Your Bank Balance Should Be a Story, Not a Number" |
| "Server-Sent Events vs WebSockets" | "Server-Sent Events: The Real-Time Pattern You're Probably Overlooking" |

**Pattern:** Move from "what it is" to "why it matters" or "what you're missing"

#### Subtitle: Where Tech Stack Belongs

**Keep .NET (or other tech) OUT of the title, put it IN the subtitle.**

The title sells the click with curiosity. The subtitle qualifies the reader with technical context.

| Element | Purpose | Example |
|---------|---------|---------|
| **Title** | Hook, curiosity | "Event Sourcing in Practice: Why Your Bank Balance Should Be a Story" |
| **Subtitle** | Tech context, audience filter | "A practical guide to Event Sourcing and CQRS in .NET 9" |

**Subtitle examples:**
- "A practical guide to Event Sourcing and CQRS in .NET 9"
- "Building auditable systems with .NET, DDD, and an append-only event store"
- "Implementing distributed transactions in .NET with MassTransit and RabbitMQ"

This way:
- Concept-focused developers click (title is universal)
- .NET developers know it's for them (subtitle qualifies)
- Non-.NET developers can still learn the patterns (concepts transfer)

### Phase 4: Structural Transformations

Apply these formatting changes:

| Source | Medium |
|--------|--------|
| H1 title | Remove (becomes Medium title field) |
| `---` dividers | Remove entirely |
| H2 (`##`) | Demote to H3 (`###`) |
| H3 (`###`) | Demote to H4 (`####`) |
| Relative image paths | Replace with uploaded image |
| Internal article links (`/articles/...`) | Placeholder: `[LINK: {slug}]` |
| Markdown tables | Convert to bullet lists |

### Phase 5: Image Generation (MANDATORY)

Medium requires PNG images. Generate PNGs from SVGs:

#### Process
1. **List all SVGs** referenced in the article
2. **Generate PNG versions** using one of:
   - Browser screenshot of SVG
   - Inkscape CLI: `inkscape input.svg --export-filename=output.png --export-width=1400`
   - ImageMagick: `convert input.svg output.png`
   - Figma export
3. **Save PNGs** to `public/images/articles/{slug}/medium/`
4. **Optimal dimensions:** 1400px wide (Medium's max content width is ~700px, 2x for retina)

#### Output Structure
```
public/images/articles/{slug}/
├── architecture.svg          (original)
├── flow.svg                  (original)
└── medium/
    ├── architecture.png      (generated)
    └── flow.png              (generated)
```

### Phase 6: Output Files

Generate two files:

#### 1. Medium Article: `{slug}.medium.md`

**If article has a GitHub repository:**
```markdown
{Condensed article content}

---

*I explore these patterns in depth on [Devocrazia](https://devocrazia.com/articles/{slug}). The full solution is available on [GitHub](https://github.com/...).*
```

**If no GitHub repository:**
```markdown
{Condensed article content}

---

*This article was originally published on [Devocrazia](https://devocrazia.com/articles/{slug}) with additional implementation details and code examples.*
```

#### GitHub Link Placement (when repo exists)

**At the end (required):** Always include the Devocrazia + GitHub call-to-action in the footer.

**At the start (optional):** For implementation-heavy articles, consider adding early context:
> "The complete implementation is available on [GitHub](https://github.com/...) — this article focuses on the reasoning behind it."

This sets expectations: Medium = concepts, GitHub = code, Devocrazia = depth.

#### 2. Publishing Checklist (console output)

---

## Output Template

### Publishing Checklist

```
## Medium Publishing Checklist for "{title}"

### Suggested Title
"{curiosity-hook-title}"

### Subtitle
"{first-paragraph-or-custom-hook}"

### Content
File: public/content/articles/{slug}.medium.md
Word count: ~{count} (condensed from ~{original})

### Images to Upload
[ ] {image1}.png - {description}
[ ] {image2}.png - {description}
...

### Placeholders to Replace
[ ] [LINK: {slug}] - Update after publishing linked article

### Tags (max 5)
{tag1}, {tag2}, {tag3}, {tag4}, {tag5}

### Canonical URL
https://devocrazia.com/articles/{slug}

### Publishing Steps
1. Create new Medium story
2. Set title: "{suggested title}"
3. Set subtitle from suggestions above
4. Copy content from {slug}.medium.md
5. Upload images from public/images/articles/{slug}/medium/
6. Update any [LINK: ...] placeholders
7. Set canonical URL
8. Add tags
9. Publish!
```

---

## Tags by Topic

| Topic | Suggested Tags |
|-------|----------------|
| Domain-Driven Design | `domain-driven-design`, `software-architecture`, `csharp`, `dotnet`, `clean-code` |
| Event Sourcing/CQRS | `event-sourcing`, `cqrs`, `software-architecture`, `dotnet`, `microservices` |
| Saga Pattern | `microservices`, `distributed-systems`, `dotnet`, `software-architecture`, `messaging` |
| Real-time/SSE | `server-sent-events`, `real-time`, `web-development`, `javascript`, `dotnet` |
| AI/LLM | `artificial-intelligence`, `llm`, `software-engineering`, `json`, `api` |

---

## Quality Checklist

Before finalising:

- [ ] **Appropriately condensed** (~50% for simple topics, more generous for complex patterns)
- [ ] **Code blocks are illustrative** (not implementation dumps)
- [ ] **Curiosity-hook title**
- [ ] **All PNGs generated** in `/medium/` folder
- [ ] **Every key concept has a diagram** (especially for architectural patterns)
- [ ] **No orphaned sections** (each section earns its place)
- [ ] **Strong opening and closing**
- [ ] **Reader can understand the pattern** after reading (the real test)
- [ ] **Canonical URL included**
