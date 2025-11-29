import { ReactNode } from "react";
import { Helmet } from "react-helmet";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  /** Additional class names for the main element */
  mainClassName?: string;
  /** Whether to show the footer (default: true) */
  showFooter?: boolean;
}

const Layout = ({
  children,
  title,
  description,
  mainClassName = "",
  showFooter = true,
}: LayoutProps) => {
  const pageTitle = title ? `${title} | Devocrazia` : "Devocrazia";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        {title && <meta property="og:title" content={pageTitle} />}
        {description && <meta property="og:description" content={description} />}
      </Helmet>

      <Header />

      <main className={`flex-1 ${mainClassName}`}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
