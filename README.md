# Devocrazia

A personal blog about software engineering, architecture, and modern development practices.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Markdown** for article rendering

## Getting Started

### Prerequisites

- Node.js 18+ or Bun

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun dev
```

The site will be available at `http://localhost:8080`

### Build

```bash
# Build for production
npm run build
# or
bun run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── public/
│   ├── content/articles/    # Markdown article files
│   ├── images/              # Images and diagrams
│   ├── favicon.ico          # Favicon
│   └── ...
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── data/                # Article metadata
│   ├── lib/                 # Utility functions
│   └── ...
└── ...
```

## Adding Articles

1. Create a markdown file in `public/content/articles/`
2. Add article metadata to `src/data/articles.ts`
3. Add any images to `public/images/articles/`

