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
  tags: string[];
  readTime: number; // in minutes
}

export const articles: Article[] = [
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
    image: "bg-gradient-to-br from-teal-800 to-teal-600",
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
    image: "bg-[#f5f0e8] flex items-center justify-center text-[#2b6cb0] text-6xl font-bold",
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
    image: "bg-gradient-to-br from-slate-200 to-slate-100",
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
    image: "bg-gradient-to-br from-slate-100 to-white",
    tags: ["Performance", "Web Dev", "Optimization"],
    readTime: 7,
  },
];
