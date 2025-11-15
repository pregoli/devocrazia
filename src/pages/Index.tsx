import ArticleCard from "@/components/ArticleCard";
import AuthorCard from "@/components/AuthorCard";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";

const articles = [
  {
    category: "CSS",
    categoryColor: "bg-category-css",
    title: "A Guide to Modern CSS Layouts",
    description:
      "Dive into Flexbox and CSS Grid to create responsive web designs that are both powerful and easy to maintain.",
    authorName: "John Doe",
    date: "Oct 26, 2023",
    image: "bg-gradient-to-br from-teal-800 to-teal-600",
  },
  {
    category: "DEVOPS",
    categoryColor: "bg-category-devops",
    title: "Getting Started with Docker Containers",
    description:
      "Learn how to containerize your applications for easier deployment, scaling, and management across different environments.",
    authorName: "Jane Smith",
    date: "Oct 24, 2023",
    image: "bg-[#f5f0e8] flex items-center justify-center text-[#2b6cb0] text-6xl font-bold",
  },
  {
    category: "UI/UX",
    categoryColor: "bg-category-uiux",
    title: "UI/UX Design Principles for Developers",
    description:
      "Discover key design principles that every developer should know to build intuitive and user-friendly interfaces.",
    authorName: "John Doe",
    date: "Oct 22, 2023",
    image: "bg-gradient-to-br from-slate-200 to-slate-100",
  },
  {
    category: "PERFORMANCE",
    categoryColor: "bg-category-performance",
    title: "Optimizing Web Performance",
    description:
      "Explore techniques for making your websites faster and more efficient, from image optimization to code splitting.",
    authorName: "Jane Smith",
    date: "Oct 20, 2023",
    image: "bg-gradient-to-br from-slate-100 to-white",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Hero />

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-foreground">Latest Articles</h2>

              <div className="space-y-6">
                {articles.map((article, index) => (
                  <ArticleCard key={index} {...article} />
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button variant="default" size="lg">
                  Load More Articles
                </Button>
              </div>
            </div>

            <aside className="space-y-6">
              <AuthorCard />
              <Categories />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
