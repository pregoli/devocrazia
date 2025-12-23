import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { articles } from "@/data/articles";

const Hero = () => {
  // Get the latest article (first in the array)
  const featuredArticle = articles[0];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Link to={`/articles/${featuredArticle.slug}`} className="aspect-video rounded-md overflow-hidden bg-muted block hover:opacity-90 transition-opacity">
          <img 
            src={featuredArticle.heroImage || featuredArticle.image} 
            alt={featuredArticle.title}
            className="w-full h-full object-cover"
          />
        </Link>

        <div className="space-y-4">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            {featuredArticle.category}
          </span>
          <Link to={`/articles/${featuredArticle.slug}`}>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight hover:text-primary transition-colors">
              {featuredArticle.title}
            </h1>
          </Link>
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