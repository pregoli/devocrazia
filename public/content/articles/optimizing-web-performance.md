# Optimizing Web Performance

Web performance directly impacts user experience, SEO rankings, and conversion rates. Let's explore practical techniques to make your websites faster.

## Why Performance Matters

Studies show that:
- 53% of mobile users abandon sites that take over 3 seconds to load
- A 1-second delay can reduce conversions by 7%
- Page speed is a Google ranking factor

## Measuring Performance

### Core Web Vitals

Google's Core Web Vitals are essential metrics:

1. **LCP (Largest Contentful Paint)**: < 2.5s
2. **FID (First Input Delay)**: < 100ms
3. **CLS (Cumulative Layout Shift)**: < 0.1

```javascript
// Measure performance
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});

perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
```

## Image Optimization

Images often account for most of a page's weight.

### Modern Formats

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Lazy Loading

```jsx
// React lazy loading
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Code Splitting

Break your JavaScript into smaller chunks:

```javascript
// Dynamic imports
const loadChart = async () => {
  const { Chart } = await import('./chart-library');
  return new Chart();
};

// Only load when needed
button.addEventListener('click', async () => {
  const chart = await loadChart();
  chart.render();
});
```

## Minimize and Compress

### CSS and JavaScript

```bash
# Using Vite (built-in)
npm run build

# Manual minification
npx terser input.js -o output.min.js
```

### Enable Compression

Configure your server to use gzip or brotli:

```nginx
# Nginx configuration
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

## Caching Strategies

### Browser Caching

```html
<!-- Cache control headers -->
<meta http-equiv="Cache-Control" content="max-age=31536000">
```

### Service Workers

```javascript
// Basic service worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## Database Optimization

Slow database queries kill performance:

```sql
-- Bad: No index
SELECT * FROM users WHERE email = 'user@example.com';

-- Good: With index
CREATE INDEX idx_users_email ON users(email);
SELECT * FROM users WHERE email = 'user@example.com';
```

> **Pro tip**: Use database query analyzers to identify slow queries.

## CDN Usage

Serve static assets from a CDN:

```html
<!-- CDN for libraries -->
<script src="https://cdn.example.com/library.min.js"></script>

<!-- CDN for images -->
<img src="https://cdn.example.com/images/hero.jpg" alt="Hero">
```

## Performance Checklist

- ✅ Optimize and compress images
- ✅ Minimize CSS and JavaScript
- ✅ Enable browser caching
- ✅ Use a CDN
- ✅ Implement lazy loading
- ✅ Code splitting for large apps
- ✅ Remove unused dependencies
- ✅ Optimize fonts
- ✅ Reduce HTTP requests
- ✅ Enable compression (gzip/brotli)

## Monitoring Tools

- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: Detailed performance analysis
- **GTmetrix**: Performance and SEO metrics
- **Chrome DevTools**: Network and performance tabs

## Conclusion

Performance optimization is an ongoing process. Start with the biggest impact changes (images and code splitting), measure the results, and iterate. Your users will thank you with better engagement and conversions.
