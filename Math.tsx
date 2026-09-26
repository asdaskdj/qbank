import { useMemo } from 'react'
import katex from 'katex'

/** Render text containing $...$ inline KaTeX segments. */
export function Math({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => renderMixed(text), [text])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function renderMixed(text: string): string {
  const parts = text.split(/(\$[^$]+\$)/g)
  return parts
    .map((p) => {
      if (p.startsWith('$') && p.endsWith('$')) {
        try {
          return katex.renderToString(p.slice(1, -1), { throwOnError: false })
        } catch {
          return escapeHtml(p)
        }
      }
      return escapeHtml(p).replace(/\n/g, '<br/>')
    })
    .join('')
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥']
