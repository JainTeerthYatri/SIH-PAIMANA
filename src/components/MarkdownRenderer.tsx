'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content text-slate-200 leading-relaxed text-sm space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 1. RESPONSIVE TABLE CONTAINER (Layout bilkul nahi tootega!)
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-900/60 shadow-lg backdrop-blur-sm">
              <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/90 text-indigo-300 uppercase tracking-wider font-semibold border-b border-slate-700">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-indigo-500/10 transition-colors duration-150">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-slate-200 text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-slate-300 text-xs border-t border-slate-800/50">
              {children}
            </td>
          ),
          // 2. STYLED HEADINGS & BOLD TEXT
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-white mt-4 mb-2 border-b border-slate-700 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-indigo-400 mt-3 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-slate-100 mt-2 mb-1">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-indigo-300">
              {children}
            </strong>
          ),
          // 3. CLEAN LISTS (BULLETS & NUMBERS)
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 my-2 pl-2 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-2 pl-2 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-xs leading-normal">{children}</li>,
          // 4. INLINE CODE & CODE BLOCKS
          code: ({ children }) => (
            <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700">
              {children}
            </code>
          ),
          // 5. PARAGRAPHS & BLOCKQUOTES
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 pl-3 italic my-2 text-slate-400 bg-indigo-950/20 py-1 rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}