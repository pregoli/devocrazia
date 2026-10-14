# Site integration

Once the article is written, wire it into the site. Article data is duplicated across several files and nothing checks they agree, so update all of them.

## Contents
- 1. Article metadata (`src/data/articles.ts`)
- 2. Prerender metadata (`scripts/prerender.js`)
- 3. Sitemap (`public/sitemap.xml`)
- 4. Images
- 5. Verify

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

## 2. Prerender metadata (scripts/prerender.js)

Add the same article to the `articles` array (`slug`, `category`, `title`, `description`, `authorName`, `date`, `heroImage`, `tags`, `readTime`). Here `heroImage` must be the **PNG** (`/images/{slug}-hero.png`), because social media crawlers do not render SVG.

## 3. Sitemap (public/sitemap.xml)

Add a `<url>` entry, using the article's `date` as `lastmod`:

```xml
<url>
  <loc>https://devocrazia.com/articles/{slug}</loc>
  <lastmod>{YYYY-MM-DD}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
  <image:image>
    <image:loc>https://devocrazia.com/images/{slug}-hero.svg</image:loc>
    <image:title>{Full Article Title}</image:title>
  </image:image>
</url>
```

## 4. Images

- `public/images/{slug}-hero.svg` and `public/images/{slug}-hero.png` (both 1200x630)
- `public/images/{slug}-preview.svg`
- Article diagrams in `public/images/articles/{topic}/`

## 5. Verify

Run `npm run build && npm test`. The tests run against the built `dist/`, so the build has to come first.
