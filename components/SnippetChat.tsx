'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Snippet } from '@/lib/types'
import { LANGUAGE_META } from '@/lib/constants'
import { streamOllama } from '@/lib/ollama-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Explique ce code ligne par ligne',
  'Quelles dépendances installer ?',
  'Comment l\'adapter pour mon projet ?',
  'Peux-tu l\'optimiser ?',
  'Donne-moi un exemple d\'utilisation',
]

interface Props {
  snippet: Snippet
  model: string
}

function buildSystemPrompt(snippet: Snippet, langLabel: string): string {
  return `Tu es un assistant expert en code. L'utilisateur te pose des questions sur ce snippet ${langLabel}${snippet.title ? ` intitulé "${snippet.title}"` : ''}.

CODE:
\`\`\`${snippet.language}
${snippet.code}
\`\`\`

Réponds en français, de manière concise et précise. Utilise du markdown pour le code.`
}

export default function SnippetChat({ snippet, model }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => { abortRef.current?.abort() }, [])
  const meta = LANGUAGE_META[snippet.language]

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }, [input])

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading || !model) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsLoading(true)
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const apiMessages = [
      { role: 'system', content: buildSystemPrompt(snippet, meta.label) },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ]

    try {
      await streamOllama({
        endpoint: '/api/chat',
        body: { model, messages: apiMessages },
        signal: abortRef.current.signal,
        onChunk: (chunk) => {
          setMessages(prev =>
            prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
          )
        },
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '_Erreur de génération. Vérifiez qu\'Ollama est disponible._' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', width: '360px', minWidth: '360px' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Bot size={11} style={{ color: '#818cf8' }} />
          </div>
          <span className="text-xs font-medium text-slate-400">Chat</span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ color: meta.color, background: meta.bg, fontSize: '10px' }}
          >
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{model.split(':')[0]}</span>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="p-1 rounded transition-colors text-slate-600 hover:text-slate-400"
              title="Effacer la conversation"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="text-center pt-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <Sparkles size={18} style={{ color: '#6366f1' }} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pose n'importe quelle question sur ce snippet.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs px-3 py-2 rounded-xl transition-all suggestion-btn"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                }}
              >
                {msg.role === 'user'
                  ? <User size={10} style={{ color: '#a5b4fc' }} />
                  : <Bot size={10} style={{ color: '#64748b' }} />
                }
              </div>

              <div
                className="text-xs leading-relaxed rounded-2xl px-3 py-2 max-w-[88%] whitespace-pre-wrap break-words"
                style={{
                  background: msg.role === 'user' ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                  color: msg.role === 'user' ? '#c7d2fe' : '#cbd5e1',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                }}
              >
                {msg.content
                  ? msg.content
                  : isLoading && i === messages.length - 1
                    ? <span className="animate-pulse text-slate-600">▌</span>
                    : null
                }
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading || !model}
            placeholder="Pose une question… (Entrée pour envoyer)"
            className="flex-1 bg-transparent text-xs text-slate-200 outline-none resize-none placeholder:text-slate-600 leading-relaxed"
            style={{ maxHeight: '100px', minHeight: '20px', height: '20px' }}
            rows={1}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || !model}
            className="p-1.5 rounded-lg transition-all shrink-0 disabled:opacity-30"
            style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}
          >
            <Send size={12} />
          </motion.button>
        </div>
        <p className="text-xs text-slate-700 mt-1 text-center">Shift+Entrée pour nouvelle ligne</p>
      </div>
    </div>
  )
}
