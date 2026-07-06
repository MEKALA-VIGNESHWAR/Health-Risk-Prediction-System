import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Square, RotateCcw, Info } from 'lucide-react'
import { AuraMark } from '@/components/layout/Logo'
import { Markdown } from '@/components/Markdown'
import { Badge, Button } from '@/components/ui'
import { useChat, type ChatMessage } from '@/features/ai/useChat'
import { cn } from '@/lib/cn'

const SUGGESTIONS = [
  'What are early warning signs of type 2 diabetes?',
  'Suggest a heart-healthy dinner under 600 calories',
  'How can I improve my sleep quality naturally?',
  'Explain what LDL and HDL cholesterol mean',
]

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1.5" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-brand-400 animate-pulse-soft"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && (
        <AuraMark className="mt-0.5 h-8 w-8 shrink-0 rounded-lg shadow-soft" />
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]',
          isUser
            ? 'rounded-tr-md bg-brand-gradient text-white shadow-soft'
            : message.error
              ? 'rounded-tl-md border border-danger/30 bg-danger/8 text-ink'
              : 'rounded-tl-md border border-line bg-card text-ink shadow-soft',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        ) : message.streaming && !message.content ? (
          <TypingDots />
        ) : (
          <>
            <Markdown>{message.content}</Markdown>
            {message.streaming && (
              <span className="ml-0.5 inline-block h-4 w-[3px] -translate-y-[1px] animate-blink rounded-full bg-brand-500 align-middle" />
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export function Assistant() {
  const { messages, isStreaming, status, send, stop, reset } = useChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const empty = messages.length === 0

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  function submit() {
    if (!input.trim() || isStreaming) return
    send(input)
    setInput('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[520px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Sparkles className="h-5.5 w-5.5" />
          </span>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
              AI Assistant
              {status && !status.configured && <Badge tone="gold">Demo mode</Badge>}
              {status?.configured && <Badge tone="success" dot>Live</Badge>}
            </h1>
            <p className="text-sm text-ink-muted">Your private health companion</p>
          </div>
        </div>
        {!empty && (
          <Button variant="secondary" size="sm" onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
            New chat
          </Button>
        )}
      </div>

      {status && !status.configured && (
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-gold-400/30 bg-gold-400/10 px-3.5 py-2.5 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          <span>
            Running in demo mode. Set <code className="font-mono text-ink">OPENAI_API_KEY</code> on the
            server to enable live, personalized answers.
          </span>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-line bg-surface/40 p-4 sm:p-6"
      >
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow animate-float">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-ink">How can I help you today?</h2>
            <p className="mt-1.5 max-w-md text-ink-muted">
              Ask about symptoms, medications, nutrition, fitness, or anything health-related.
            </p>
            <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="group rounded-xl border border-line bg-card px-4 py-3 text-left text-sm text-ink-muted transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-ink hover:shadow-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="pt-3">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-card p-2 shadow-soft focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message AuraHealth…"
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-subtle"
          />
          {isStreaming ? (
            <Button variant="secondary" size="icon" onClick={stop} aria-label="Stop generating">
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button size="icon" onClick={submit} disabled={!input.trim()} aria-label="Send message">
              <Send className="h-4.5 w-4.5" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-ink-subtle">
          AuraHealth can make mistakes. This is general information, not medical advice.
        </p>
      </div>
    </div>
  )
}
