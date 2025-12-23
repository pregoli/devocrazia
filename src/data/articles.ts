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
  repositoryUrl?: string; // Optional link to source code
}

export const articles: Article[] = [
  {
    id: 0,
    slug: "mastering-saga-pattern-distributed-transactions-dotnet",
    category: "Patterns",
    categoryColor: "bg-category-patterns",
    title: "Mastering the Saga Pattern for Distributed Transactions in .NET 10",
    description:
      "A comprehensive guide to implementing the Saga Pattern with MassTransit, RabbitMQ, and SQL Server. Learn orchestration, automatic compensation, and the Outbox pattern for reliable distributed workflows.",
    authorName: "Paolo Regoli",
    date: "2025-12-23",
    image: "/images/saga-pattern-preview.svg",
    heroImage: "/images/saga-pattern-hero.svg",
    tags: [".NET", "Saga Pattern", "MassTransit", "Microservices"],
    readTime: 12,
    repositoryUrl: "https://github.com/pregoli/SagaDemo",
  },
  {
    id: 1,
    slug: "building-bank-atm-event-sourcing-cqrs-dotnet",
    category: "Patterns",
    categoryColor: "bg-category-patterns",
    title: "Building a Bank ATM System with Event Sourcing and CQRS in .NET 9",
    description:
      "A deep dive into implementing Event Sourcing, CQRS, and Domain-Driven Design for a production-ready banking system. Covers aggregates, projections, snapshotting, and multiple query strategies.",
    authorName: "Paolo Regoli",
    date: "2025-07-20",
    image: "/images/event-sourcing-cqrs-preview.svg",
    heroImage: "/images/event-sourcing-cqrs-hero.svg",
    tags: [".NET", "Event Sourcing", "CQRS", "DDD"],
    readTime: 15,
    repositoryUrl: "https://github.com/pregoli/Flagstone.ATM",
  },
  {
    id: 2,
    slug: "optimising-llm-inputs-json-vs-toon-explained",
    category: "AI",
    categoryColor: "bg-category-ai",
    title: "Optimizing LLM Inputs: JSON vs TOON Explained",
    description:
      "Learn how TOON offers a more token-efficient alternative to JSON when sending structured data to LLMs. This article breaks down real-world use cases, conversion methods, and best practices for optimizing AI workflows.",
    authorName: "Paolo Regoli",
    date: "2025-11-15",
    image: "/images/json-vs-toon-preview.svg",
    heroImage: "/images/json-vs-toon-hero.svg",
    tags: ["AI", "Optimization"],
    readTime: 7,
  },
];
