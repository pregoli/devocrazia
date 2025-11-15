import { Card } from "./ui/card";

const categories = [
  { name: "JavaScript", count: 12 },
  { name: "Cloud", count: 7 },
  { name: "DevOps", count: 5 },
  { name: "UI/UX Design", count: 9 },
  { name: "Databases", count: 4 },
];

const Categories = () => {
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
