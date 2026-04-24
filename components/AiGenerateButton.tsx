'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, Loader2, AlertCircle } from 'lucide-react'
import { useOllamaModel } from '@/hooks/useOllamaModel'

export interface AiResult {
  title: string
  language: string
  category: string
  description: string
  tags: string
  notes: string
}

interface Props {
  code: string
  onResult: (result: AiResult) => void
}

const VALID_LANGUAGES = ['react','typescript','python','bash','powershell','csharp','sql','dockerfile','css']
const VALID_CATEGORIES = ['component','script','utility']

function emptyResult(): AiResult {
  return { title: '', language: '', category: '', description: '', tags: '', notes: '' }
}

function parseResponse(text: string): AiResult {
  console.debug('[Ollama raw]', text)

  // Try JSON first (most reliable)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const d = JSON.parse(jsonMatch[0])
      const lang = String(d.language ?? '').toLowerCase().trim()
      const cat  = String(d.category ?? '').toLowerCase().trim()
      return {
        title:       String(d.title       ?? '').trim(),
        language:    VALID_LANGUAGES.includes(lang) ? lang : '',
        category:    VALID_CATEGORIES.includes(cat)  ? cat  : '',
        description: String(d.description ?? '').trim(),
        tags:        Array.isArray(d.tags) ? d.tags.join(', ') : String(d.tags ?? '').trim(),
        notes:       String(d.notes       ?? '').trim(),
      }
    } catch {
      console.warn('[Ollama] JSON parse failed, falling back to section parser')
    }
  }

  // Fallback: section marker parser (case-insensitive, allows optional colon)
  const section = (key: string): string => {
    const re = new RegExp(`\\[${key}\\]:?\\s*([\\s\\S]*?)(?=\\[\\w+\\]|$)`, 'i')
    return re.exec(text)?.[1]?.trim() ?? ''
  }
  const lang = section('LANGUAGE').toLowerCase().split(/\s/)[0]
  const cat  = section('CATEGORY').toLowerCase().split(/\s/)[0]
  return {
    title:       section('TITLE'),
    language:    VALID_LANGUAGES.includes(lang) ? lang : '',
    category:    VALID_CATEGORIES.includes(cat)  ? cat  : '',
    description: section('DESCRIPTION'),
    tags:        section('TAGS'),
    notes:       section('NOTES'),
  }
}

export default function AiGenerateButton({ code, onResult }: Props) {
  const { model, models, isLoading, available, setModel } = useOllamaModel()
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!code.trim() || !model) return
    setGenerating(true)
    setError(null)
    setPreview('')

    try {
      const res = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, code }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setPreview(full)
      }

      onResult(parseResponse(full))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setGenerating(false)
      setPreview('')
    }
  }

  if (isLoading) return null

  if (!available) {
    return (
      <div
        className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
        style={{
          color: '#f59e0b',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.15)',
        }}
      >
        <AlertCircle size={13} />
        Ollama non disponible — lancez Ollama localement pour activer la génération IA
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Model selector */}
        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={generating}
            className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg outline-none transition-colors disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
            }}
          >
            {models.map((m) => (
              <option key={m} value={m} className="bg-[#13131a]">{m}</option>
            ))}
          </select>
          <ChevronDown
            size={11}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#475569' }}
          />
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !code.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-40"
          style={{
            background: generating ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {generating ? 'Génération en cours…' : "Générer avec l'IA"}
        </button>
      </div>

      {/* Streaming preview */}
      {preview && (
        <div
          className="text-xs rounded-lg p-2.5 font-mono leading-relaxed max-h-20 overflow-hidden text-slate-600"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          {preview.slice(-200)}
          <span className="animate-pulse">▌</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  )
}
