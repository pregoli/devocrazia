import { Github, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SocialLinks = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="outline" className="flex items-center gap-2" asChild>
        <a
          href="https://github.com/pregoli"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </Button>

      <Button variant="outline" className="flex items-center gap-2" asChild>
        <a
          href="https://www.linkedin.com/in/pregoli"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </a>
      </Button>
    </div>
  );
};

export default SocialLinks;