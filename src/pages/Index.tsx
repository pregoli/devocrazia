import { useMemo } from "react";
import ArticleCard from "@/components/ArticleCard";
import AuthorCard from "@/components/AuthorCard";
import Categories from "@/components/Categories";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { articles } from "@/data/articles";
import { formatDate } from "@/lib/utils";

const LATEST_ARTICLES_COUNT = 4;

const Index = () => {
  const latestArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, LATEST_ARTICLES_COUNT)
      .map((article) => ({
        ...article,
        date: formatDate(article.date),
      }));
  }, []);

  return (
    <Layout
      title="Home"
      description="Devocrazia - A blog about software engineering, architecture, and cloud technologies."
    >
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
    </Layout>
  );
};

export default Index;
