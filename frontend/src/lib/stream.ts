import { API_BASE, authHeaders } from './api'

/**
 * POST a JSON body and consume a Server-Sent-Events response as a stream of
 * text tokens. We use fetch (not EventSource) because EventSource cannot send
 * the Authorization header, and the backend streams `data:` frames terminated
 * by a `[DONE]` sentinel.
 *
 * Each SSE frame payload is expected to be JSON: {"delta": "..."} for a token,
 * or {"error": "..."} on failure. Plain-text frames are also tolerated.
 */
export interface StreamHandlers {
  onDelta: (text: string) => void
  onDone?: () => void
  onError?: (message: string) => void
  signal?: AbortSignal
}

export async function streamChat(
  path: string,
  body: unknown,
  handlers: StreamHandlers,
): Promise<void> {
  const { onDelta, onDone, onError, signal } = handlers
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { ...authHeaders(), Accept: 'text/event-stream' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
    onError?.('Network error — could not reach the AI service.')
    return
  }

  if (!res.ok || !res.body) {
    let msg = `AI service error (${res.status})`
    try {
      const j = await res.json()
      if (j?.message) msg = String(j.message)
    } catch {
      /* ignore */
    }
    onError?.(msg)
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const flushFrame = (frame: string) => {
    // A frame may contain multiple `data:` lines; concatenate their payloads.
    const dataLines = frame
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).replace(/^ /, ''))
    if (dataLines.length === 0) return
    const payload = dataLines.join('\n')
    if (payload === '[DONE]') {
      onDone?.()
      return
    }
    try {
      const obj = JSON.parse(payload)
      if (obj.error) {
        onError?.(String(obj.error))
      } else if (typeof obj.delta === 'string') {
        onDelta(obj.delta)
      } else if (typeof obj.content === 'string') {
        onDelta(obj.content)
      }
    } catch {
      // Not JSON — treat as raw text token.
      if (payload) onDelta(payload)
    }
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      // SSE frames are separated by a blank line.
      let sep: number
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        flushFrame(frame)
      }
    }
    if (buffer.trim()) flushFrame(buffer)
    onDone?.()
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
    onError?.('The AI response was interrupted.')
  }
}
