'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Trash2, Edit2, Code2, FileText, Maximize2, Minimize2, MessageSquare } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Snippet } from '@/lib/types'
import { LANGUAGE_META } from '@/lib/constants'
import { deleteSnippet } from '@/app/actions/snippets'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useOllamaModel } from '@/hooks/useOllamaModel'

const SnippetFormModal = dynamic(() => import('./SnippetFormModal'), { ssr: false })
const SnippetChat = dynamic(() => import('./SnippetChat'), { ssr: false })

function NotesCodeTabs({ snippet }: { snippet: Snippet }) {
  const [activeTab, setActiveTab] = useState<number | 'notes'>(0)
  const hasNotes = Boolean(snippet.notes)

  const files = snippet.tabs && snippet.tabs.length > 0
    ? snippet.tabs
    : [{ name: 'main', language: snippet.language, code: snippet.code }]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        className="flex gap-1 px-6 pt-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {files.map((f, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-lg transition-all"
            style={{
              background: activeTab === i ? '#0d0d14' : 'transparent',
              color: activeTab === i ? '#e2e8f0' : '#475569',
              borderBottom: activeTab === i ? '2px solid #6366f1' : '2px solid transparent',
            }}
          >
            <Code2 size={12} />
            {f.name || `Fichier ${i + 1}`}
          </button>
        ))}

        {hasNotes && (
          <button
            onClick={() => setActiveTab('notes')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-lg transition-all"
            style={{
              background: activeTab === 'notes' ? '#0d0d14' : 'transparent',
              color: activeTab === 'notes' ? '#e2e8f0' : '#475569',
              borderBottom: activeTab === 'notes' ? '2px solid #6366f1' : '2px solid transparent',
            }}
          >
            <FileText size={12} />
            Notes IA
          </button>
        )}
      </div>

      {typeof activeTab === 'number' ? (
        <div className="overflow-auto flex-1" style={{ fontFamily: 'var(--font-geist-mono, monospace)', background: '#0d0d14' }}>
          <SyntaxHighlighter
            language={LANGUAGE_META[files[activeTab].language as keyof typeof LANGUAGE_META]?.prism || 'typescript'}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1.25rem 1.5rem',
              background: 'transparent',
              fontSize: '0.825rem',
              lineHeight: '1.65',
              borderRadius: 0,
              minHeight: '100%',
            }}
            showLineNumbers
            lineNumberStyle={{ color: '#2d2d3a', userSelect: 'none', minWidth: '2.5rem' }}
          >
            {files[activeTab].code}
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
  const [isZen, setIsZen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { model } = useOllamaModel()
  const meta = LANGUAGE_META[snippet.language]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA'
      if (inInput) return
      if (e.key === 'Escape') { isZen ? setIsZen(false) : isChatOpen ? setIsChatOpen(false) : onClose() }
      if (e.key === 'f' || e.key === 'F') { setIsZen(z => !z); setIsChatOpen(false) }
      if (e.key === 'c' || e.key === 'C') { setIsChatOpen(c => !c); setIsZen(false) }
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, isZen, isChatOpen])

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

  const actionButtons = (
    <>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
        style={{
          background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
          color: copied ? '#4ade80' : '#94a3b8',
          border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? 'Copié !' : 'Copier'}
      </button>
      <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 bg-white/5 hover:bg-indigo-500/10 transition-colors" title="Modifier (E)">
        <Edit2 size={15} />
      </button>
      <button onClick={handleDelete} disabled={isDeleting} className="p-2 rounded-lg text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Supprimer">
        <Trash2 size={15} />
      </button>
      <div className="w-px h-5 bg-white/10" />
      <button
        onClick={() => { setIsChatOpen(c => !c); setIsZen(false) }}
        className="p-2 rounded-lg transition-colors"
        style={{
          background: isChatOpen ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
          color: isChatOpen ? '#a5b4fc' : '#64748b',
        }}
        title="Chat sur le snippet (C)"
      >
        <MessageSquare size={15} />
      </button>
      <button
        onClick={() => setIsZen(z => !z)}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-white/5 transition-colors"
        title={isZen ? 'Quitter le mode zen (F)' : 'Mode zen (F)'}
      >
        {isZen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
      </button>
      <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-white/5 transition-colors" title="Fermer (Échap)">
        <X size={16} />
      </button>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, background: isZen ? '#0a0a0f' : 'rgba(0,0,0,0.75)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: isZen ? 'none' : 'blur(4px)', padding: isZen ? 0 : '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isZen) onClose() }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="flex flex-col overflow-hidden"
        style={{
          background: '#13131a',
          border: isZen ? 'none' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: isZen ? 0 : '1rem',
          boxShadow: isZen ? 'none' : '0 24px 64px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: isZen ? '100%' : isChatOpen ? 'min(90rem, 97vw)' : '56rem',
          height: isZen ? '100%' : 'auto',
          maxHeight: isZen ? '100%' : '90vh',
        }}
      >
        {/* Header — compact en mode zen */}
        {isZen ? (
          <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
              <span className="text-sm text-slate-300 truncate">{snippet.title}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-3 shrink-0">{actionButtons}</div>
          </div>
        ) : (
          <div className="flex items-start justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span>
                <span className="text-xs text-slate-500">{snippet.category}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-100">{snippet.title}</h2>
              <p className="text-sm text-slate-400">{snippet.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">{actionButtons}</div>
          </div>
        )}

        {/* Body — split en deux colonnes quand le chat est ouvert */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Colonne code */}
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            {!isZen && (
              <div className="flex gap-2 px-6 pt-3 shrink-0 flex-wrap">
                {snippet.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <NotesCodeTabs snippet={snippet} />

            {!isZen && (
              <div className="px-6 py-2 shrink-0 text-xs text-slate-600 flex items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span>Ajouté le {new Date(snippet.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>·</span>
                <span><kbd className="px-1.5 py-0.5 rounded text-slate-700 font-mono" style={{ background: 'rgba(255,255,255,0.05)' }}>F</kbd> zen</span>
                <span><kbd className="px-1.5 py-0.5 rounded text-slate-700 font-mono" style={{ background: 'rgba(255,255,255,0.05)' }}>C</kbd> chat</span>
              </div>
            )}
          </div>

          {/* Panneau chat */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="overflow-hidden shrink-0 h-full"
              >
                {model && <SnippetChat snippet={snippet} model={model} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
