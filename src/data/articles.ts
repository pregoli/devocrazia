export interface Article {
  id: number;
  slug: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string;
  date: string; // ISO date string
  image: string;
  heroImage?: string; // Optional larger image for detail page
  tags: string[];
  readTime: number; // in minutes
}

export const articles: Article[] = [
  {
    id: 0,
    slug: "optimising-llm-inputs-json-vs-toon-explained",
    category: "AI",
    categoryColor: "bg-category-ai",
    title: "Optimizing LLM Inputs: JSON vs TOON Explained",
    description:
      "Learn how TOON offers a more token-efficient alternative to JSON when sending structured data to LLMs. This article breaks down real-world use cases, conversion methods, and best practices for optimizing AI workflows.",
    authorName: "Paolo Regoli",
    date: "2025-11-15",
    image: "/images/json-vs-toon-preview.png",
    heroImage: "/images/json-vs-toon-hero.png",
    tags: ["AI", "Optimization"],
    readTime: 7,
  },
  {
    id: 1,
    slug: "a-guide-to-modern-css-layouts",
    category: "CSS",
    categoryColor: "bg-category-css",
    title: "A Guide to Modern CSS Layouts",
    description:
      "Dive into Flexbox and CSS Grid to create responsive web designs that are both powerful and easy to maintain.",
    authorName: "John Doe",
    date: "2023-10-26",
    image: "/images/css-layouts-preview.png",
    tags: ["CSS", "Flexbox", "Grid"],
    readTime: 5,
  },
  {
    id: 2,
    slug: "getting-started-with-docker-containers",
    category: "DEVOPS",
    categoryColor: "bg-category-devops",
    title: "Getting Started with Docker Containers",
    description:
      "Learn how to containerize your applications for easier deployment, scaling, and management across different environments.",
    authorName: "Jane Smith",
    date: "2023-10-24",
    image: "/images/docker-containers-preview.png",
    tags: ["Docker", "DevOps", "Containers"],
    readTime: 8,
  },
  {
    id: 3,
    slug: "ui-ux-design-principles-for-developers",
    category: "UI/UX",
    categoryColor: "bg-category-uiux",
    title: "UI/UX Design Principles for Developers",
    description:
      "Discover key design principles that every developer should know to build intuitive and user-friendly interfaces.",
    authorName: "John Doe",
    date: "2023-10-22",
    image: "/images/uiux-design-preview.png",
    tags: ["UI/UX", "Design", "Frontend"],
    readTime: 6,
  },
  {
    id: 4,
    slug: "optimizing-web-performance",
    category: "PERFORMANCE",
    categoryColor: "bg-category-performance",
    title: "Optimizing Web Performance",
    description:
      "Explore techniques for making your websites faster and more efficient, from image optimization to code splitting.",
    authorName: "Jane Smith",
    date: "2023-10-20",
    image: "/images/web-performance-preview.png",
    tags: ["Performance", "Web Dev", "Optimization"],
    readTime: 7,
  },
];
