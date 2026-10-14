# Site integration

Once the article is written, wire it into the site. `src/data/articles.ts` is the single source of truth: the app, the prerendered social-preview pages (`scripts/prerender.js`), and `sitemap.xml` are all generated from it, so there is only one metadata entry to add.

## 1. Article metadata (src/data/articles.ts)

Add an entry matching the `Article` interface:

```typescript
{
  id: {next_id}, // sequential, starting at 0
  slug: "{url-friendly-slug}",
  category: "{API|Patterns|AI|DevOps|Performance|CSS|UI/UX}",
  categoryColor: "bg-category-{api|patterns|ai|devops|performance|css|uiux}",
  title: "{Full Article Title}",
  description: "{150-200 char description for SEO}",
  authorName: "Paolo Regoli",
  date: "{YYYY-MM-DD}",
  image: "/images/{slug}-preview.svg",
  heroImage: "/images/{slug}-hero.svg",
  tags: ["{tag1}", "{tag2}", "{tag3}"],
  readTime: {X}, // number of minutes
  repositoryUrl: "{https://github.com/user/repo}", // optional, if provided
}
```

`categoryColor` has to be one of the `category-*` colours defined in `tailwind.config.ts`, otherwise the category badge renders without a colour.

## 2. Images

- `public/images/{slug}-hero.svg` and `public/images/{slug}-hero.png` (both 1200x630). Social media crawlers don't render SVG, so the prerendered page uses the PNG; its path is derived from `heroImage` by swapping the extension, so the two files must share a name.
- `public/images/{slug}-preview.svg`
- Article diagrams in `public/images/articles/{topic}/`

## 3. Verify

Run `npm run build && npm test`.

The build fails with a list of problems if an article's markdown file, preview image, hero SVG, or hero PNG is missing, or if a slug or id is duplicated. Fix everything it lists and rebuild. The tests run against the built `dist/`, so the build has to come first.
