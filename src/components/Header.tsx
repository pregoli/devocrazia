import { Moon, Sun, BookOpen, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import { NavLink } from "./NavLink";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Devocrazia</span>
          </NavLink>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </NavLink>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Articles
              </a>
              <NavLink to="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </NavLink>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </nav>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-foreground hover:text-primary"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground hover:text-primary"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col gap-4 pt-4 pb-2 border-t border-border/50 mt-4">
            <NavLink to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </NavLink>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Articles
            </a>
            <NavLink to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </NavLink>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
