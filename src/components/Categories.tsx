import { Card } from "./ui/card";
import { articles } from "@/data/articles";
import { useMemo } from "react";

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
          <div
            key={category.name}
            className="flex items-center justify-between py-2 hover:text-primary cursor-pointer transition-colors"
          >
            <span className="text-card-foreground">{category.name}</span>
            <span className="text-muted-foreground text-sm">{category.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Categories;
