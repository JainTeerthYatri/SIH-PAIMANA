'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content text-slate-900 leading-relaxed text-sm space-y-2 font-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 1. RESPONSIVE TABLE WITH HIGH-CONTRAST BLACK TEXT
          table: ({ children }) => (
            <div className="my-3 w-full overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-xs">
              <table className="w-full min-w-[500px] border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-200 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-100/80 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold text-slate-900 text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-slate-900 text-xs border-t border-slate-200 font-medium">
              {children}
            </td>
          ),

          // 2. HEADINGS IN SOLID DARK / BLACK TEXT
          h1: ({ children }) => (
            <h1 className="text-xl font-extrabold text-slate-900 mt-3 mb-1.5 border-b border-slate-300 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-slate-900 mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-slate-900 mt-2 mb-1">
              {children}
            </h3>
          ),

          // 3. BOLD & PARAGRAPHS
          strong: ({ children }) => (
            <strong className="font-extrabold text-slate-900">
              {children}
            </strong>
          ),
          p: ({ children }) => (
            <p className="mb-1.5 leading-relaxed text-slate-900 font-normal">
              {children}
            </p>
          ),

          // 4. LISTS IN BLACK
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-1 pl-1 text-slate-900">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-1 pl-1 text-slate-900">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-900 text-xs md:text-sm font-normal">
              {children}
            </li>
          ),

          // 5. CODE & QUOTES
          code: ({ children }) => (
            <code className="bg-slate-100 text-slate-900 border border-slate-300 px-1.5 py-0.5 rounded text-xs font-mono font-semibold">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-600 pl-3 italic my-2 text-slate-900 bg-blue-50/60 py-1.5 rounded-r font-medium">
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