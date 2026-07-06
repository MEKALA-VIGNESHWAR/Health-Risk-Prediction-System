import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/cn'

/** Renders assistant markdown with the app's prose-chat styling. */
export const Markdown = memo(function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div className={cn('prose-chat', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
})
