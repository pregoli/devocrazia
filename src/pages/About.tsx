import Header from "@/components/Header";
import Footer from "@/components/Footer";
import authorAvatar from "@/assets/author-avatar.jpg";
import { Github, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Portrait Image */}
            <div className="w-full md:w-80 flex-shrink-0 flex justify-center md:justify-start">
              <img
                src={authorAvatar}
                alt="Alex Doe"
                className="w-40 h-40 md:w-80 md:h-auto object-cover rounded-full md:rounded-md shadow-md"
              />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-foreground mb-3">Alex Doe</h1>
                <h2 className="text-2xl text-primary font-medium">
                  Senior Software Engineer & Cloud Architect
                </h2>
              </div>

              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  Alex is a Senior Software Engineer with a passion for building scalable
                  and efficient cloud-native applications. With over a decade of
                  experience in the tech industry, they specialize in Go, Kubernetes, and
                  distributed systems architecture.
                </p>

                <p>
                  Throughout their career, Alex has led teams at both startups and large
                  enterprises, focusing on creating robust backend services and fostering
                  a culture of technical excellence. They believe in the power of well-
                  crafted code and elegant solutions to solve complex problems.
                </p>

                <p>
                  When not coding, Alex enjoys contributing to open-source projects,
                  speaking at tech conferences, and exploring hiking trails. This blog is a
                  space for them to share insights, tutorials, and reflections on the ever-
                  evolving world of software development.
                </p>
              </div>

              {/* Connect Section */}
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-foreground mb-6">Connect with Me</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Twitter / X
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <a href="https://example.com" target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
