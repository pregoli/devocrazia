import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Globe } from "lucide-react";
import { Helmet } from "react-helmet";

const Contact = () => {

  return (
    <>
      <Helmet>
        <title>Contact | Devocrazia</title>
        <meta name="description" content="Get in touch with me. Have a question, project proposal, or just want to say hi? I'd love to hear from you." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Get in Touch
              </h1>
              <p className="text-lg text-muted-foreground">
                Have a question, a project proposal, or just want to say hi? I'd love to hear from you.
              </p>
            </div>

            {/* Contact Form */}
            <form action="https://formsubmit.co/paolo.regoli@gmail.com" method="POST" className="space-y-6">
              {/* FormSubmit Configuration */}
              <input type="hidden" name="_subject" value="New enquiry from Devocrazia website" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Your Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Write your message here..."
                  rows={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
              >
                Send Message
              </Button>
            </form>

            {/* Social Links */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-6">Or find me on</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="https://github.com/pregoli" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a href="https://www.linkedin.com/in/pregoli" target="_blank" rel="noopener noreferrer">
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
                  <a href="https://yourwebsite.com" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
