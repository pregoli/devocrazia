import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

const Giscus = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const giscusTheme = theme === "dark" ? "dark" : "light";
    
    // Remove existing iframe if theme changes
    const existingScript = containerRef.current?.querySelector("script");
    const existingIframe = containerRef.current?.querySelector("iframe");
    if (existingScript) existingScript.remove();
    if (existingIframe) existingIframe.remove();

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "pregoli/devocrazia");
    script.setAttribute("data-repo-id", "R_kgDOQWavew");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOQWave84C0LU2");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "en");
    script.crossOrigin = "anonymous";
    script.async = true;

    containerRef.current?.appendChild(script);
  }, [theme]);

  return <div ref={containerRef} className="giscus mt-12" />;
};

export default Giscus;