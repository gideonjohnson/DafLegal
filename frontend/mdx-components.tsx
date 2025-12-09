import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-6 mt-8">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold text-[#1a2e1a] dark:text-[#f5edd8] mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold text-[#1a2e1a] dark:text-[#f5edd8] mb-3 mt-6">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-base text-[#5c4a3d] dark:text-[#d4c5b0] mb-4 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-[#5c4a3d] dark:text-[#d4c5b0] mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-[#5c4a3d] dark:text-[#d4c5b0] mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="ml-4">{children}</li>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-[#d4a561] hover:text-[#b8965a] underline transition-colors"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#d4a561] pl-4 py-2 mb-4 italic text-[#5c4a3d] dark:text-[#d4c5b0] bg-[#f5edd8]/30 dark:bg-[#1a2e1a]/30">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-[#f5edd8] dark:bg-[#1a2e1a] px-2 py-1 rounded text-sm font-mono text-[#d4a561]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-[#1a2e1a] dark:bg-[#0f1a0f] p-4 rounded-lg overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    ...components,
  }
}
