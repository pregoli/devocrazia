import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
  repositoryUrl?: string;
}

const ArticleCard = ({
  slug,
  category,
  categoryColor,
  title,
  description,
  date,
  image,
  tags,
  repositoryUrl,
}: ArticleCardProps) => {
  return (
    <article className="relative border-t border-border/50 dark:border-border/80 pt-6 pb-6 hover:opacity-95 transition-opacity">
      <div className="flex flex-col sm:flex-row gap-6">
        <Link to={`/articles/${slug}`} className="block flex-shrink-0">
          {image.startsWith("/") || image.startsWith("http") ? (
            <img
              src={image}
              alt={title}
              className="w-full sm:w-44 h-44 rounded-md object-cover bg-muted"
            />
          ) : (
            <div className={`w-full sm:w-44 h-44 rounded-md ${image}`} />
          )}
        </Link>

        <div className="flex-1 space-y-3">
          <Badge
            variant="secondary"
            className={`${categoryColor} text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-sm`}
          >
            {category}
          </Badge>

          <h3 className="font-bold text-xl text-foreground leading-tight">
            <Link
              to={`/articles/${slug}`}
              className="hover:text-primary transition-colors"
            >
              {title}
            </Link>
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Link key={tag} to={`/articles?tag=${encodeURIComponent(tag)}`}>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold rounded-none border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="View source code"
              >
                <Github className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Code</span>
              </a>
            )}
          </div>

          <p className="text-muted-foreground text-sm pt-1">{date}</p>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;