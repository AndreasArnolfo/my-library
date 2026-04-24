import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { model, prompt } = await req.json()

  if (!model || !prompt) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  let ollamaRes: Response
  try {
    ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: true }),
      signal: AbortSignal.timeout(120_000),
    })
  } catch {
    return NextResponse.json({ error: 'Impossible de contacter Ollama' }, { status: 503 })
  }

  if (!ollamaRes.ok) {
    return NextResponse.json({ error: `Ollama: ${ollamaRes.statusText}` }, { status: 500 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of decoder.decode(value, { stream: true }).split('\n')) {
            if (!line.trim()) continue
            try {
              const json = JSON.parse(line)
              if (json.response) controller.enqueue(encoder.encode(json.response))
            } catch { /* skip malformed lines */ }
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
