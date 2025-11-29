
'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className }) => {
  return (
    <div className={cn("prose prose-slate max-w-none dark:prose-invert", className)}>
      {/* - prose: Adds standard typography styles 
        - prose-slate: Sets the color theme
        - dark:prose-invert: Inverts colors for dark mode automatically
        - remarkPlugins: Adds support for tables, strikethrough, etc.
      */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
