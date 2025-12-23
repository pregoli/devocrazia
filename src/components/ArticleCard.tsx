import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string;
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
  authorName,
  authorAvatar,
  date,
  image,
  tags,
  repositoryUrl,
}: ArticleCardProps) => {
  return (
    <Link 
      to={`/articles/${slug}`}
      className="block border-t border-border/50 dark:border-border/80 pt-6 pb-6 hover:opacity-95 transition-opacity"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {image.startsWith('/') || image.startsWith('http') ? (
          <img 
            src={image} 
            alt={title}
            className="w-full sm:w-44 h-44 flex-shrink-0 rounded-md object-cover bg-muted"
          />
        ) : (
          <div className={`w-full sm:w-44 h-44 flex-shrink-0 rounded-md ${image}`} />
        )}

        <div className="flex-1 space-y-3">
          <Badge
            variant="secondary"
            className={`${categoryColor} text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-sm`}
          >
            {category}
          </Badge>

          <h3 className="font-bold text-xl text-foreground leading-tight hover:text-primary cursor-pointer transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/articles?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
              >
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
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="View source code"
              >
                <Github className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Code</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Avatar className="h-9 w-9">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-foreground">{authorName}</p>
              <p className="text-muted-foreground text-xs">{date}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
