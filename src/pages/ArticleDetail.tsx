import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { articles } from "@/data/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Helmet } from "react-helmet";
import authorAvatar from "@/assets/author-avatar.jpg";
import { CodeBlock } from "@/components/CodeBlock";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const article = articles.find((a) => a.slug === slug);

  useEffect(() => {
    if (!article) {
      return;
    }

    const loadMarkdown = async () => {
      try {
        const response = await fetch(`/content/articles/${slug}.md`);
        if (!response.ok) {
          throw new Error("Failed to load article content");
        }
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error loading markdown:", error);
        setContent("# Content not available\n\nSorry, we couldn't load the article content.");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [slug, article]);

  if (!article) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              Sorry, we couldn't find the article you're looking for.
            </p>
            <Button onClick={() => navigate("/articles")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formattedDate = new Date(article.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Helmet>
        <title>{article.title} | Devocrazia</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/articles")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>

          {/* Article header */}
          <header className="mb-8">
            <Link
              to={`/articles?category=${encodeURIComponent(article.category)}`}
              className="inline-block mb-4"
            >
              <Badge 
                variant="secondary"
                className={`${article.categoryColor} text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity`}
              >
                {article.category}
              </Badge>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={authorAvatar} alt={article.authorName} />
                  <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{article.authorName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.date}>{formattedDate}</time>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </header>

          {/* Featured image */}
          <div className={`w-full h-64 md:h-96 rounded-lg mb-8 overflow-hidden ${article.image}`}>
            {article.image.includes("text-") && (
              <div className="w-full h-full flex items-center justify-center">
                <span>🐳</span>
              </div>
            )}
          </div>

          {/* Article content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading article...</p>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-foreground leading-relaxed">{children}</p>
                  ),
                  code: CodeBlock,
                  pre: ({ children }) => (
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto mb-6 border border-border">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Tags */}
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className="text-xs font-semibold rounded-none border-primary text-primary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default ArticleDetail;
