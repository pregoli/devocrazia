import { useState, useRef, useEffect } from "react";
import { Share2, Linkedin, Link, Check } from "lucide-react";

// X (Twitter) brand icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

const ShareButton = ({ url, title, description }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build full URL - use window.location if url is relative
  const fullUrl = url.startsWith("http") 
    ? url 
    : `${window.location.origin}${url}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=600");
    setIsOpen(false);
  };

  const shareToX = () => {
    const text = `${title}${description ? ` - ${description}` : ""}`;
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer,width=600,height=400");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Main share button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/30"
        aria-label="Share article"
        aria-expanded={isOpen}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 py-2 w-44 bg-background border border-border rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <button
            onClick={shareToLinkedIn}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            <span>LinkedIn</span>
          </button>
          
          <button
            onClick={shareToX}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <XIcon className="h-4 w-4" />
            <span>X (Twitter)</span>
          </button>
          
          <div className="h-px bg-border my-1 mx-2" />
          
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
