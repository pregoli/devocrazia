import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { articles } from "@/data/articles";

const Hero = () => {
  // Get the latest article (first in the array)
  const featuredArticle = articles[0];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="aspect-video rounded-md overflow-hidden bg-muted">
          <img 
            src={featuredArticle.heroImage || featuredArticle.image} 
            alt={featuredArticle.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            {featuredArticle.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {featuredArticle.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {featuredArticle.description}
          </p>
          <Button asChild className="mt-4">
            <Link to={`/articles/${featuredArticle.slug}`}>Read More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
