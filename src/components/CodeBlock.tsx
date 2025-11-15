import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

export const CodeBlock = ({ className, children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  
  // Inline code detection (no className means inline)
  const isInline = !className;
  
  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-sm">
        {children}
      </code>
    );
  }

  // Block code - extract text content for copying
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (node && typeof node === 'object' && 'props' in node) {
      return getTextContent(node.props.children);
    }
    return '';
  };

  const codeText = getTextContent(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            <span className="text-xs">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 mr-1" />
            <span className="text-xs">Copy</span>
          </>
        )}
      </Button>
      <code className={className}>{children}</code>
    </div>
  );
};
