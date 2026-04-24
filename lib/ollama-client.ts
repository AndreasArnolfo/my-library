const STORAGE_KEY = 'ollama:url'
export const DEFAULT_OLLAMA_URL = 'http://localhost:11434'

export function getOllamaUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_OLLAMA_URL
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_OLLAMA_URL
}

export function saveOllamaUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/+$/, ''))
}

// Fetch available models
export async function fetchModels(baseUrl?: string): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl ?? getOllamaUrl()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.models ?? []).map((m: { name: string }) => m.name)
  } catch {
    return []
  }
}

// Unified streaming helper for /api/generate and /api/chat
// Calls onChunk with each text fragment, returns the full text
export async function streamOllama({
  endpoint,
  body,
  onChunk,
  signal,
  baseUrl,
}: {
  endpoint: '/api/generate' | '/api/chat'
  body: object
  onChunk: (chunk: string) => void
  signal?: AbortSignal
  baseUrl?: string
}): Promise<string> {
  const url = `${baseUrl ?? getOllamaUrl()}${endpoint}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  })

  if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`)

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let full = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        if (!line.trim()) continue
        try {
          const json = JSON.parse(line)
          // /api/generate → json.response  |  /api/chat → json.message.content
          const chunk: string = json.response ?? json.message?.content ?? ''
          if (chunk) { onChunk(chunk); full += chunk }
        } catch { /* skip malformed line */ }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}
