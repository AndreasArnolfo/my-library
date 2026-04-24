'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
  model: string
  prompt: string
  onResult: (text: string) => void
  disabled?: boolean
  stream?: boolean
}

export default function AiFieldButton({ model, prompt, onResult, disabled, stream = true }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!model || disabled || loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt }),
      })
      if (!res.ok) return

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        if (stream) onResult(text)
      }

      // Final call: trimmed, only if not already streaming (avoids double-call)
      if (!stream) onResult(text.trim())
      else if (text !== text.trim()) onResult(text.trim())
    } catch (err) {
      console.error('[AiFieldButton]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled || !model}
      title={loading ? 'Génération…' : "Générer avec l'IA"}
      className="flex items-center justify-center w-5 h-5 rounded transition-all disabled:opacity-30"
      style={{
        color: loading ? '#6366f1' : '#4a5568',
      }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.color = '#a5b4fc' }}
      onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.color = '#4a5568' }}
    >
      {loading
        ? <Loader2 size={12} className="animate-spin" />
        : <Sparkles size={12} />
      }
    </button>
  )
}
