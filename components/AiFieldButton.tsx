'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { streamOllama } from '@/lib/ollama-client'

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
      let accumulated = ''
      const full = await streamOllama({
        endpoint: '/api/generate',
        body: { model, prompt },
        onChunk: (chunk) => {
          if (stream) { accumulated += chunk; onResult(accumulated) }
        },
      })
      onResult(full.trim())
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
