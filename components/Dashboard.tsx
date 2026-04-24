'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Code2, Terminal, Wrench, X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { Snippet, Language, Category } from '@/lib/types'
import { LANGUAGE_META, CATEGORY_META } from '@/lib/constants'

const CodeModal = dynamic(() => import('./CodeModal'), { ssr: false })
const SnippetFormModal = dynamic(() => import('./SnippetFormModal'), { ssr: false })

const CATEGORY_ICONS = {
  component: Code2,
  script: Terminal,
  utility: Wrench,
}

export default function Dashboard({ initialSnippets = [] }: { initialSnippets: Snippet[] }) {
  const [search, setSearch] = useState('')
  const [activeLanguage, setActiveLanguage] = useState<Language | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [selected, setSelected] = useState<Snippet | null>(null)
  const [showForm, setShowForm] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const inInput = document.activeElement?.tagName === 'INPUT' ||
                      document.activeElement?.tagName === 'TEXTAREA' ||
                      (document.activeElement as HTMLElement)?.isContentEditable

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
        return
      }
      if (e.key === 'n' && !inInput && !selected && !showForm) {
        setShowForm(true)
        return
      }
      if (e.key === 'Escape' && !selected && !showForm && search) {
        setSearch('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, showForm, search])

  const languages = useMemo(() => {
    const counts = new Map<Language, number>()
    for (const s of initialSnippets) {
      counts.set(s.language, (counts.get(s.language) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return initialSnippets.filter((s) => {
      if (activeLanguage && s.language !== activeLanguage) return false
      if (activeCategory && s.category !== activeCategory) return false
      if (q) {
        return (
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q))
        )
      }
      return true
    })
  }, [search, activeLanguage, activeCategory])

  function clearFilters() {
    setSearch('')
    setActiveLanguage(null)
    setActiveCategory(null)
  }

  const hasFilter = search || activeLanguage || activeCategory

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0f', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col gap-6 p-4 overflow-y-auto"
        style={{ background: '#0f0f16', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            L
          </div>
          <span className="font-semibold text-sm text-slate-200">Dev Library</span>
        </div>

        {/* Catégories */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Catégories</p>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left"
              style={{
                background: !activeCategory ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: !activeCategory ? '#a5b4fc' : '#64748b',
              }}
            >
              <span>Tout</span>
              <span className="text-xs">{initialSnippets.length}</span>
            </button>
            {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([cat, meta]) => {
              const Icon = CATEGORY_ICONS[cat]
              const count = initialSnippets.filter((s) => s.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left"
                  style={{
                    background: activeCategory === cat ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: activeCategory === cat ? '#a5b4fc' : '#64748b',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={13} />
                    {meta.label}
                  </span>
                  <span className="text-xs">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Langages */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Langages</p>
          <div className="flex flex-col gap-0.5">
            {languages.map(([lang, count]) => {
              const meta = LANGUAGE_META[lang]
              return (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(activeLanguage === lang ? null : lang)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all text-left group"
                  style={{
                    background: activeLanguage === lang ? meta.bg : 'transparent',
                    color: activeLanguage === lang ? meta.color : '#64748b',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: meta.color }}
                    />
                    {meta.label}
                  </span>
                  <span className="text-xs">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="px-6 py-4 flex items-center gap-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#4a5568' }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher par titre, description ou tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-sm rounded-xl outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0',
              }}
            />
            <kbd
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded font-mono pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#4a5568', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ⌘K
            </kbd>
          </div>
          <div className="text-sm text-slate-500 shrink-0">
            {filtered.length} snippet{filtered.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors shrink-0 bg-indigo-500 text-white hover:bg-indigo-600"
          >
            <Plus size={14} />
            Nouveau
            <kbd className="text-xs px-1 py-0.5 rounded font-mono ml-1 opacity-70" style={{ background: 'rgba(255,255,255,0.15)' }}>N</kbd>
          </button>
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
            >
              <X size={12} />
              Réinitialiser
            </button>
          )}
        </header>

        {/* Active filters pills */}
        {(activeLanguage || activeCategory) && (
          <div className="flex gap-2 px-6 pt-3 shrink-0">
            {activeLanguage && (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: LANGUAGE_META[activeLanguage].bg,
                  color: LANGUAGE_META[activeLanguage].color,
                  border: `1px solid ${LANGUAGE_META[activeLanguage].color}33`,
                }}
              >
                {LANGUAGE_META[activeLanguage].label}
                <button onClick={() => setActiveLanguage(null)}>
                  <X size={10} />
                </button>
              </span>
            )}
            {activeCategory && (
              <span
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                {CATEGORY_META[activeCategory].label}
                <button onClick={() => setActiveCategory(null)}>
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-full gap-3 text-slate-600"
              >
                <Search size={40} strokeWidth={1} />
                <p className="text-sm">Aucun snippet trouvé</p>
                <button onClick={clearFilters} className="text-xs text-indigo-400 hover:underline">
                  Réinitialiser les filtres
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((snippet, i) => (
                    <SnippetCard key={snippet.id} snippet={snippet} index={i} onClick={() => setSelected(snippet)} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selected && <CodeModal snippet={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showForm && <SnippetFormModal onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  )
}

function SnippetCard({ snippet, onClick, index }: { snippet: Snippet; onClick: () => void; index: number }) {
  const meta = LANGUAGE_META[snippet.language]
  const preview = snippet.code.split('\n').slice(0, 3).join('\n')

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: `0 10px 28px ${meta.color}20` }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left flex flex-col gap-3 p-4 rounded-xl group"
      style={{
        background: '#13131a',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = meta.color + '44' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: meta.color, background: meta.bg }}
        >
          {meta.label}
        </span>
        <span className="text-xs text-slate-600">
          {new Date(snippet.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div>
        <h3 className="font-medium text-sm text-slate-200 mb-1">{snippet.title}</h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{snippet.description}</p>
      </div>

      {/* Code preview */}
      <div
        className="rounded-lg p-3 text-xs overflow-hidden"
        style={{
          background: '#0d0d14',
          fontFamily: 'var(--font-geist-mono, monospace)',
          color: '#4a5568',
          lineHeight: '1.5',
          maxHeight: '60px',
        }}
      >
        {preview}
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {snippet.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#475569' }}
          >
            #{tag}
          </span>
        ))}
        {snippet.tags.length > 3 && (
          <span className="text-xs text-slate-700">+{snippet.tags.length - 3}</span>
        )}
      </div>
    </motion.button>
  )
}
