# Devocrazia

A personal blog about software engineering, architecture, and modern development practices.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Markdown** for article rendering
- **Playwright** for E2E testing

## Getting Started

### Prerequisites

- Node.js 22+ (see `.node-version`)

### Installation

```bash
npm install
npx playwright install chromium
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:8080`

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test              # Run all tests headless
npm run test:headed   # Run with browser visible
npm run test:ui       # Interactive UI mode
```

### Preview Production Build

```bash
npm run preview
```

## Development Workflow

This project uses a PR-based workflow: `main` only accepts squash-merged pull requests, and the `Lint, build, test` CI check must pass. No approval is required, since GitHub does not let authors approve their own PRs.

### Making Changes

```bash
# 1. Start from main
git checkout main
git pull

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes

# 4. Run tests locally
npm run build
npm test

# 5. Commit
git add .
git commit -m "Add your feature"

# 6. Push branch
git push -u origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to [GitHub repo](https://github.com/pregoli/devocrazia)
2. Click **Compare & pull request**
3. Add a descriptive title (this becomes the commit message)
4. Click **Create pull request**
5. Wait for the `Lint, build, test` check to pass (green checkmark)
6. Click **Squash and merge**

### After Merge

```bash
git checkout main
git pull
git branch -d feature/your-feature-name  # Delete local branch
```

## Working with Claude Code

The repo ships project skills in `.claude/skills/`. Type them as slash commands in Claude Code; the text after the command is the input.

### Write a new article

Start on a branch first (`git checkout -b article/your-article-slug`), then:

```
/devocrazia-article-author Why most teams don't need microservices
/devocrazia-article-author Idempotent consumers in .NET https://github.com/pregoli/some-repo
```

A topic is required; a repo URL is optional and is used as evidence, not retold. The skill:

1. Studies the repo, if there is one.
2. Interviews you in rounds: your thesis, the production story behind it, what most teams do instead, the trade-offs, the reader, and the title and tags. Each question comes with a recommended answer, worded so that "yes" accepts it. Say "skip the interview" if you want a quick draft.
3. Writes the article, then runs `humanizer` on it to strip AI writing patterns.
4. Draws the hero, preview, and diagram SVGs in the house style, and renders the hero PNG.
5. Adds the `src/data/articles.ts` entry and runs `npm run build && npm test`.

Read the draft, edit what doesn't sound like you, and open a PR.

### Publish an article on Medium

Once the article is merged and live (the Medium version links back to it):

```
/devocrazia-medium-publish rich-domain-modelling-escape-anaemic-models
```

The slug or the title both work. It writes a shorter `{slug}.medium.md` with a Medium title and subtitle, renders the diagrams to PNG, and prints a checklist. Posting is manual: create the story, paste the content, upload the PNGs from `public/images/articles/{topic}/medium/`, fill in the `[LINK: ...]` placeholders, set the canonical URL, and add the tags. The checklist walks you through it.

### Plan a site change

```
/grill-me add an RSS feed
```

The agent interviews you until nothing about the change is left assumed. It doesn't write anything: the agreement lives in the conversation. From there, either build it right away, or turn it into issues:

```
/to-spec       # turns the conversation into a spec issue on GitHub
/to-tickets    # splits the spec into small ticket issues, each listing what blocks it
```

Later, in any session: "implement #14". The agent reads the issue, works on a branch, and opens a PR with `Closes #14`, so merging closes it. The open issues are the backlog.

### What happens without asking

- Both article skills run `humanizer` on their drafts.
- The `pr` skill shapes PR bodies: a summary visual, before and after evidence, and a merge danger call.
- `npm run build` fails on any em dash in an article or its metadata.

## Adding a New Article

These are the manual steps; `/devocrazia-article-author` does all of them for you except the branch.

### 1. Create feature branch

```bash
git checkout main && git pull
git checkout -b article/your-article-slug
```

### 2. Add article content

Create markdown file: `public/content/articles/your-article-slug.md`

Don't use em dashes (—) in articles or their metadata; `npm run build` rejects them.

### 3. Add article metadata

Add entry to `src/data/articles.ts`. This is the only place article metadata lives: the social preview pages and `sitemap.xml` are generated from it at build time.

```typescript
{
  id: 5,  // Next available ID (IDs are sequential, starting at 0)
  slug: "your-article-slug",
  category: "Patterns",  // or "API", "AI", etc.
  categoryColor: "bg-category-patterns",  // must match a category-* colour in tailwind.config.ts
  title: "Your Article Title",
  description: "Brief description for previews and SEO.",
  authorName: "Paolo Regoli",
  date: "2025-01-24",  // ISO format
  image: "/images/your-article-preview.svg",
  heroImage: "/images/your-article-hero.svg",
  tags: ["Tag1", "Tag2"],
  readTime: 10,
  repositoryUrl: "https://github.com/pregoli/your-repo",  // Optional
}
```

### 4. Add images

- Hero image (1200x630): `public/images/your-article-hero.svg` **and** `public/images/your-article-hero.png`
- Preview image: `public/images/your-article-preview.svg`
- Article diagrams: `public/images/articles/your-article/`

The PNG hero is required for social media previews, since crawlers do not render SVG. It must have the same name as the SVG, because its path is derived from `heroImage`.

`npm run build` fails with a clear error if the markdown file or any of these images is missing.

### 5. Test, commit, and create PR

```bash
npm run build
npm test
git add .
git commit -m "Add article: Your Article Title"
git push -u origin article/your-article-slug
```

Then create PR on GitHub.

## Project Structure

```
├── .github/workflows/   # CI/CD
├── e2e/                 # Playwright tests
├── public/
│   ├── content/articles/    # Markdown article files
│   ├── images/              # Images and diagrams
│   └── ...
├── scripts/
│   └── prerender.js     # SEO pre-rendering and sitemap generation
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── data/            # Article metadata
│   └── lib/             # Utility functions
└── ...
```

## Deployment

Cloudflare Pages auto-deploys on merge to `main`.

- Push to `main` → Cloudflare builds → Live at [devocrazia.com](https://devocrazia.com)
