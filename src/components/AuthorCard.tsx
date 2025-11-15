import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import authorAvatar from "@/assets/author-avatar.jpg";

const AuthorCard = () => {
  return (
    <Card className="p-6 text-center space-y-4">
      <Avatar className="h-24 w-24 mx-auto">
        <AvatarImage src={authorAvatar} alt="Alex Doe" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>

      <div>
        <h3 className="font-bold text-xl text-card-foreground">Alex Doe</h3>
        <p className="text-muted-foreground text-sm mt-2">
          Senior Software Engineer and tech enthusiast, passionate about building clean, efficient,
          and scalable applications.
        </p>
      </div>
    </Card>
  );
};

export default AuthorCard;
