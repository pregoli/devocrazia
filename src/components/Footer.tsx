import { NavLink } from "./NavLink";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-foreground font-semibold">© 2024 Devocrazia. All rights reserved.</p>
            <p className="text-muted-foreground text-sm">A blog for modern software developers.</p>
          </div>

          <nav className="flex gap-6">
            <NavLink to="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </NavLink>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <NavLink to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </NavLink>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
