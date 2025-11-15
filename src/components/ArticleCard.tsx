import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface ArticleCardProps {
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  image: string;
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
}: ArticleCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow border-0 border-t border-border/50">
      <div className="flex flex-col sm:flex-row gap-6 p-0">
        <div className={`w-full sm:w-44 h-44 flex-shrink-0 ${image}`} />

        <div className="flex-1 space-y-3 p-6 pl-0 sm:pr-6">
          <Badge
            className={`${categoryColor} text-white text-xs font-semibold uppercase tracking-wider rounded-sm`}
            variant="secondary"
          >
            {category}
          </Badge>

          <h3 className="font-bold text-xl text-card-foreground leading-tight hover:text-primary cursor-pointer transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

          <div className="flex items-center gap-3 pt-1">
            <Avatar className="h-9 w-9">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-card-foreground">{authorName}</p>
              <p className="text-muted-foreground text-xs">{date}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ArticleCard;
