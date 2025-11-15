import ArticleCard from "@/components/ArticleCard";
import AuthorCard from "@/components/AuthorCard";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";
import { format } from "date-fns";

const Index = () => {
  // Sort articles by date (newest first) and take the latest 4
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map((article) => ({
      ...article,
      date: format(new Date(article.date), "MMM dd, yyyy"),
    }));
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Hero />

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Latest Articles</h2>

              <div className="space-y-0">
                {latestArticles.map((article) => (
                  <ArticleCard key={article.id} {...article} />
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button variant="default" size="lg" asChild>
                  <a href="/articles">Load More Articles</a>
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
