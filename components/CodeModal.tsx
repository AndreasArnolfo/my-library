'use client'

import { useEffect, useState } from 'react'
import { X, Copy, Check, Trash2, Edit2, Code2, FileText } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Snippet } from '@/lib/types'
import { LANGUAGE_META } from '@/lib/constants'
import { deleteSnippet } from '@/app/actions/snippets'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SnippetFormModal = dynamic(() => import('./SnippetFormModal'), { ssr: false })

function NotesCodeTabs({ snippet, meta }: { snippet: Snippet; meta: typeof LANGUAGE_META[keyof typeof LANGUAGE_META] }) {
  const [tab, setTab] = useState<'code' | 'notes'>('code')
  const hasNotes = Boolean(snippet.notes)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {hasNotes && (
        <div
          className="flex gap-1 px-6 pt-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {(['code', 'notes'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-lg transition-all"
              style={{
                background: tab === t ? '#0d0d14' : 'transparent',
                color: tab === t ? '#e2e8f0' : '#475569',
                borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              {t === 'code' ? <Code2 size={12} /> : <FileText size={12} />}
              {t === 'code' ? 'Code' : 'Notes IA'}
            </button>
          ))}
        </div>
      )}

      {tab === 'code' ? (
        <div className="overflow-auto flex-1" style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>
          <SyntaxHighlighter
            language={meta.prism}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.25rem 1.5rem',
              background: '#0d0d14',
              fontSize: '0.825rem',
              lineHeight: '1.65',
              borderRadius: 0,
              minHeight: '100%',
            }}
            showLineNumbers
            lineNumberStyle={{ color: '#2d2d3a', userSelect: 'none', minWidth: '2.5rem' }}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      ) : (
        <div className="overflow-auto flex-1 px-6 py-4">
          <pre
            className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: 'var(--font-geist-sans, sans-serif)' }}
          >
            {snippet.notes}
          </pre>
        </div>
      )}
    </div>
  )
}

interface Props {
  snippet: Snippet
  onClose: () => void
}

export default function CodeModal({ snippet, onClose }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const meta = LANGUAGE_META[snippet.language]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (confirm('Voulez-vous vraiment supprimer ce snippet ?')) {
      setIsDeleting(true)
      await deleteSnippet(snippet.id)
      router.refresh()
      onClose()
    }
  }

  if (isEditing) {
    return (
      <SnippetFormModal
        initialData={snippet}
        onClose={() => {
          setIsEditing(false)
          onClose() // Close the current detail modal too to reflect changes when routing refreshes
        }}
      />
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: '#13131a',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.label}
              </span>
              <span className="text-xs text-slate-500">{snippet.category}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-100">{snippet.title}</h2>
            <p className="text-sm text-slate-400">{snippet.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                color: copied ? '#4ade80' : '#94a3b8',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg transition-colors text-slate-400 hover:text-indigo-400 bg-white/5 hover:bg-indigo-500/10"
              title="Modifier"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg transition-colors text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 disabled:opacity-50"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 px-6 pt-3 shrink-0 flex-wrap">
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Tabs: Code / Notes */}
        <NotesCodeTabs snippet={snippet} meta={meta} />

        <div
          className="px-6 py-2 shrink-0 text-xs text-slate-600"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          Ajouté le {new Date(snippet.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · Échap pour fermer
        </div>
      </div>
    </div>
  )
}
