import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { articles } from "@/data/articles";
import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import { Helmet } from "react-helmet";
import defaultAuthorAvatar from "@/assets/author-avatar.jpg";
import { CodeBlock } from "@/components/CodeBlock";
import { formatDateLong } from "@/lib/utils";
import Giscus from "@/components/Giscus";

// Site configuration
const SITE_URL = import.meta.env.VITE_SITE_URL || "";
const SITE_NAME = import.meta.env.VITE_SITE_NAME || "Devocrazia";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`;

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
        setContent(
          "# Content not available\n\nSorry, we couldn't load the article content."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [slug, article]);

  // Use article's avatar if provided, otherwise fall back to default
  const authorAvatarSrc = article?.authorAvatar || defaultAuthorAvatar;

  if (!article) {
    return (
      <Layout title="Article Not Found">
        <div className="container mx-auto px-4 py-16">
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
        </div>
      </Layout>
    );
  }

  const formattedDate = formatDateLong(article.date);
  const heroImageSrc = article.heroImage || article.image;
  
  // Build absolute URLs for SEO
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const ogImageUrl = heroImageSrc.startsWith("http") 
    ? heroImageSrc 
    : `${SITE_URL}${heroImageSrc}`;

  // JSON-LD Structured Data for Article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": ogImageUrl,
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Person",
      "name": article.authorName,
      "url": `${SITE_URL}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "keywords": article.tags.join(", "),
    "articleSection": article.category,
    "wordCount": content.split(/\s+/).length,
    "timeRequired": `PT${article.readTime}M`
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{article.title} | {SITE_NAME}</title>
        <meta name="title" content={`${article.title} | ${SITE_NAME}`} />
        <meta name="description" content={article.description} />
        <meta name="author" content={article.authorName} />
        <meta name="keywords" content={article.tags.join(", ")} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={articleUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_GB" />
        
        {/* Article-specific OG tags */}
        <meta property="article:published_time" content={article.date} />
        <meta property="article:modified_time" content={article.date} />
        <meta property="article:author" content={article.authorName} />
        <meta property="article:section" content={article.category} />
        {article.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={articleUrl} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${article.readTime} min read`} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Layout showFooter={true}>
        <div className="container mx-auto px-4 py-8">
          <article className="max-w-6xl mx-auto">
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

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={article.date}>{formattedDate}</time>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{article.readTime} min read</span>
                </div>

                {article.repositoryUrl && (
                  <a
                    href={article.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/30"
                  >
                    <Github className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">View Source</span>
                  </a>
                )}
              </div>
            </header>

            {/* Featured image */}
            {heroImageSrc.startsWith("/") || heroImageSrc.startsWith("http") ? (
              <div className="w-full rounded-lg mb-8 bg-muted p-4 md:p-8 flex items-center justify-center">
                <img
                  src={heroImageSrc}
                  alt={`Featured image for ${article.title}`}
                  className="w-full max-h-[600px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div
                className={`w-full h-64 md:h-96 rounded-lg mb-8 overflow-hidden ${heroImageSrc}`}
              >
                {heroImageSrc.includes("text-") && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span>🐳</span>
                  </div>
                )}
              </div>
            )}

            {/* Article content */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading article...</p>
              </div>
            ) : (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold mt-6 mb-3 text-foreground">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-foreground leading-relaxed">
                        {children}
                      </p>
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/articles?tag=${encodeURIComponent(tag)}`}
                    >
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold rounded-none border-primary text-primary hover:bg-primary/10 transition-colors"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>

                {article.repositoryUrl && (
                  <a
                    href={article.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <Github className="h-4 w-4" />
                      View on GitHub
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <Giscus />
          </article>
        </div>
      </Layout>
    </>
  );
};

export default ArticleDetail;
