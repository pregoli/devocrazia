import { ReactNode } from "react";
import { Helmet } from "react-helmet";
import Header from "./Header";
import Footer from "./Footer";
import type { PageMeta } from "@/lib/site";

interface LayoutProps {
  children: ReactNode;
  /** Title and head tags, from staticPageMeta(), articlePageMeta() or noindexPageMeta() in src/lib/site.ts */
  meta: PageMeta;
  /** Additional class names for the main element */
  mainClassName?: string;
  /** Whether to show the footer (default: true) */
  showFooter?: boolean;
}

const Layout = ({
  children,
  meta,
  mainClassName = "",
  showFooter = true,
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* The prerendered HTML has the same tags marked as Helmet's, so Helmet replaces them on load and on every navigation. */}
      <Helmet>
        <title>{meta.title}</title>
        {meta.tags.map(({ tag: Tag, attrs }, i) => (
          <Tag key={i} {...attrs} />
        ))}
      </Helmet>

      <Header />

      <main className={`flex-1 ${mainClassName}`}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
