import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const ThankYou = () => {
  return (
    <Layout
      title="Message Sent"
      description="Thank you for getting in touch. I'll get back to you soon."
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Thank You!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Your message has been sent successfully. I'll get back to you as soon as possible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/articles">Read Articles</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ThankYou;
