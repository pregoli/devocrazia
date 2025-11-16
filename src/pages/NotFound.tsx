import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, FileText } from "lucide-react";
import { Helmet } from "react-helmet";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Devocrazia</title>
        <meta name="description" content="Sorry, the page you are looking for doesn't exist or has been moved." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Text */}
          <h1 className="text-[150px] md:text-[200px] font-bold leading-none text-primary">
            404
          </h1>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Oops! Page Not Found.
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sorry, the page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search the blog..."
              className="pl-10 h-12"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/articles">
                <FileText className="mr-2 h-4 w-4" />
                View All Articles
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NotFound;
