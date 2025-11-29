import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, FileText } from "lucide-react";

const NotFound = () => {
  return (
    <Layout
      title="404 - Page Not Found"
      description="Sorry, the page you are looking for doesn't exist or has been moved."
      mainClassName="flex items-center justify-center px-4 py-16"
    >
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
          Sorry, the page you are looking for might have been moved, renamed, or is
          temporarily unavailable.
        </p>

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
    </Layout>
  );
};

export default NotFound;
