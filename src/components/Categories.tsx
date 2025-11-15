import { Card } from "./ui/card";
import { articles } from "@/data/articles";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const Categories = () => {
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    articles.forEach((article) => {
      const count = categoryMap.get(article.category) || 0;
      categoryMap.set(article.category, count + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-bold text-xl text-card-foreground">Categories</h3>

      <div className="space-y-2">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/articles?category=${encodeURIComponent(category.name)}`}
            className="flex items-center justify-between py-2 cursor-pointer transition-colors group"
          >
            <span className="text-card-foreground group-hover:text-primary transition-colors">{category.name}</span>
            <span className="text-muted-foreground text-sm group-hover:text-primary transition-colors">{category.count}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default Categories;
