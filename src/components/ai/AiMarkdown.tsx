"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

const markdownComponents: Components = {
  h1: ({ node, ...props }) => {
    void node;
    return <h3 {...props} />;
  },
  h2: ({ node, ...props }) => {
    void node;
    return <h3 {...props} />;
  },
  h3: ({ node, ...props }) => {
    void node;
    return <h3 {...props} />;
  },
  table: ({ node, ...props }) => {
    void node;
    return (
      <div
        className="ai-markdown-table-shell"
        role="region"
        aria-label="Tabel data dari Catatin AI"
        tabIndex={0}
      >
        <table {...props} />
      </div>
    );
  },
  a: ({ node, href, children, ...props }) => {
    void node;
    const isExternal = Boolean(href && /^https?:\/\//i.test(href));
    return (
      <a
        {...props}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
};

interface AiMarkdownProps {
  content: string;
  className?: string;
}

function AiMarkdownComponent({
  content,
  className = "",
}: AiMarkdownProps) {
  return (
    <div className={`ai-markdown markdown-body ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={markdownComponents}
        skipHtml
        disallowedElements={["img"]}
        unwrapDisallowed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const AiMarkdown = memo(AiMarkdownComponent);
