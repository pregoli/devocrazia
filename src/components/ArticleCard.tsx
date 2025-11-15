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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <div className={`w-full sm:w-32 h-32 rounded-lg flex-shrink-0 ${image}`} />

        <div className="flex-1 space-y-3">
          <Badge
            className={`${categoryColor} text-white`}
            variant="secondary"
          >
            {category}
          </Badge>

          <h3 className="font-bold text-lg text-card-foreground leading-tight hover:text-primary cursor-pointer transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>

          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
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
