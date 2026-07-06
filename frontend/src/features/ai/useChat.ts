import { useCallback, useEffect, useRef, useState } from 'react'
import { streamChat } from '@/lib/stream'
import { api } from '@/lib/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  error?: boolean
}

export interface AiStatus {
  configured: boolean
  model: string
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [status, setStatus] = useState<AiStatus | null>(null)
  const conversationId = useRef<string>(uid())
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    api
      .get<AiStatus>('/ai/status')
      .then(setStatus)
      .catch(() => setStatus({ configured: false, model: 'unknown' }))
  }, [])

  const patch = useCallback((id: string, fn: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)))
  }, [])

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed }
      const assistantId = uid()
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', streaming: true },
      ])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      void streamChat(
        '/ai/chat',
        { conversationId: conversationId.current, message: trimmed },
        {
          signal: controller.signal,
          onDelta: (chunk) =>
            patch(assistantId, (m) => ({ ...m, content: m.content + chunk })),
          onError: (msg) =>
            patch(assistantId, (m) => ({
              ...m,
              content: m.content || msg,
              error: true,
              streaming: false,
            })),
          onDone: () => {
            patch(assistantId, (m) => ({ ...m, streaming: false }))
            setIsStreaming(false)
            abortRef.current = null
          },
        },
      )
    },
    [isStreaming, patch],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)))
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    const prevId = conversationId.current
    conversationId.current = uid()
    setMessages([])
    setIsStreaming(false)
    // Best-effort: clear server-side memory for the old conversation.
    void api.post('/ai/chat/reset', { conversationId: prevId, message: '' }).catch(() => {})
  }, [])

  return { messages, isStreaming, status, send, stop, reset }
}
