import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface ArticleCardProps {
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  image: string;
  tags: string[];
}

const ArticleCard = ({
  category,
  categoryColor,
  title,
  description,
  authorName,
  authorAvatar,
  date,
  image,
  tags,
}: ArticleCardProps) => {
  return (
    <div className="border-t border-border/50 dark:border-border/80 pt-6 pb-6 hover:opacity-95 transition-opacity">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className={`w-full sm:w-44 h-44 flex-shrink-0 rounded-md ${image}`} />

        <div className="flex-1 space-y-3">
          <Badge
            className={`${categoryColor} text-white text-xs font-semibold uppercase tracking-wider rounded-sm`}
            variant="secondary"
          >
            {category}
          </Badge>

          <h3 className="font-bold text-xl text-foreground leading-tight hover:text-primary cursor-pointer transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-semibold rounded-none border-primary text-primary"
              >
                {tag}
              </Badge>
            ))}
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
    </div>
  );
};

export default ArticleCard;
