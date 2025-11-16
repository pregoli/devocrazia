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

      <Button variant="outline" className="flex items-center gap-2" asChild>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Twitter / X
        </a>
      </Button>

      <Button variant="outline" className="flex items-center gap-2" asChild>
        <a
          href="https://yourwebsite.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Globe className="h-4 w-4" />
          Website
        </a>
      </Button>
    </div>
  );
};

export default SocialLinks;