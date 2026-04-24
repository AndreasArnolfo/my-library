'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Edit, ChevronDown, Plus } from 'lucide-react'
import type { Snippet, Language, Category, CodeTab } from '@/lib/types'
import { LANGUAGE_META, CATEGORY_META } from '@/lib/constants'
import { createSnippet, updateSnippet } from '@/app/actions/snippets'
import { useRouter } from 'next/navigation'
import { useOllamaModel } from '@/hooks/useOllamaModel'
import AiFieldButton from './AiFieldButton'

interface Props {
  initialData?: Snippet | null
  onClose: () => void
}

export default function SnippetFormModal({ initialData, onClose }: Props) {
  const router = useRouter()
  const { model, models, available, setModel } = useOllamaModel()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title:       initialData?.title       ?? '',
    description: initialData?.description ?? '',
    category:    initialData?.category    ?? 'component',
    tags:        initialData?.tags?.join(', ') ?? '',
    notes:       initialData?.notes       ?? '',
  })

  const [tabs, setTabs] = useState<CodeTab[]>(
    initialData?.tabs && initialData.tabs.length > 0
      ? initialData.tabs
      : [{ name: 'main', language: initialData?.language ?? 'typescript', code: initialData?.code ?? '' }]
  )
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function set(field: string) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function updateActiveTab(field: keyof CodeTab, value: string) {
    setTabs(prev => {
      const copy = [...prev]
      copy[activeTab] = { ...copy[activeTab], [field]: value }
      return copy
    })
  }

  function addTab() {
    setTabs(prev => [...prev, { name: `tab${prev.length + 1}`, language: 'typescript', code: '' }])
    setActiveTab(tabs.length)
  }

  function removeTab(idx: number) {
    if (tabs.length === 1) return
    setTabs(prev => prev.filter((_, i) => i !== idx))
    setActiveTab(Math.max(0, activeTab - 1))
  }

  // Prompts ciblés par champ
  const hasCode = tabs[activeTab].code.trim().length > 0
  const ctx = `Language: ${tabs[activeTab].language}\n\nCode:\n${tabs[activeTab].code}`

  const prompts = {
    title:       `For this code snippet, write a short descriptive title in French (5 words max, no punctuation, no quotes).\n\n${ctx}`,
    language:    `Detect the programming language or framework of this code. Reply with ONLY one of these exact values, nothing else: react, typescript, python, bash, powershell, csharp, sql, dockerfile, css, html, javascript\n\n${tabs[activeTab].code}`,
    category:    `Classify this code snippet. Reply with ONLY one of these exact values, nothing else: component, script, utility\n\n${tabs[activeTab].code}`,
    description: `In one French sentence, describe what this code does. No title, no intro, just the sentence.\n\n${ctx}`,
    tags:        `List 4-6 relevant lowercase tags for this code, separated by commas. No explanation, just the tags.\n\n${ctx}`,
    notes:       `In French, write documentation for this code using exactly this structure:\n\n## Utilisation\n[When and where to use this, 2-3 sentences]\n\n## Dépendances\n[List required packages as: package-name — short description. If none, write: Aucune dépendance externe]\n\n## Exemple d'intégration\n[Brief usage example or context]\n\n${ctx}`,
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      title:       form.title,
      description: form.description,
      language:    tabs[0].language as Language,
      category:    form.category,
      tags:        form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      code:        tabs[0].code,
      tabs:        tabs,
      notes:       form.notes || null,
    }

    const result = initialData?.id
      ? await updateSnippet(initialData.id, payload)
      : await createSnippet(payload)

    setLoading(false)
    if (result && !result.success) {
      setError(result.error ?? 'Une erreur est survenue.')
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-2xl bg-[#13131a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            {initialData ? <><Edit size={18} /> Modifier</> : <><Save size={18} /> Nouveau snippet</>}
          </h2>
          <div className="flex items-center gap-3">
            {/* Sélecteur de modèle */}
            {available && (
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="appearance-none pl-2.5 pr-6 py-1 text-xs rounded-lg outline-none"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#a5b4fc',
                  }}
                >
                  {models.map((m) => (
                    <option key={m} value={m} className="bg-[#13131a] text-slate-200">{m}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400" />
              </div>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-white/5 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
          )}

          {/* Code Tabs Editor */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">Fichiers / Code</label>
              <AiFieldButton model={model} prompt={prompts.language} onResult={(v) => {
                const clean = v.trim().toLowerCase()
                if (['react','typescript','javascript','html','python','bash','powershell','csharp','sql','dockerfile','css'].includes(clean)) {
                  updateActiveTab('language', clean)
                }
              }} disabled={!hasCode} stream={false} />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {tabs.map((tab, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border ${activeTab === i ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'}`}>
                  <button type="button" onClick={() => setActiveTab(i)} className="outline-none">
                    {tab.name || `Tab ${i + 1}`}
                  </button>
                  {tabs.length > 1 && (
                    <button type="button" onClick={() => removeTab(i)} className="hover:text-red-400 text-slate-500 transition-colors ml-1">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTab} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 transition-colors">
                <Plus size={14} /> Ajouter
              </button>
            </div>
            
            <div className="flex gap-2 mb-1">
              <input 
                value={tabs[activeTab].name}
                onChange={e => updateActiveTab('name', e.target.value)}
                placeholder="Nom (ex: index.html)"
                className="flex-1 px-3 py-2 bg-[#0d0d14] border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-200"
              />
              <select
                value={tabs[activeTab].language}
                onChange={e => updateActiveTab('language', e.target.value)}
                className="w-1/3 px-3 py-2 bg-[#0d0d14] border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-200 appearance-none"
              >
                {Object.entries(LANGUAGE_META).map(([key, meta]) => (
                  <option key={key} value={key} className="bg-[#13131a]">{meta.label}</option>
                ))}
              </select>
            </div>

            <textarea
              required
              value={tabs[activeTab].code}
              onChange={e => updateActiveTab('code', e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none font-mono text-slate-300 resize-none"
              placeholder={`Collez votre code ${tabs[activeTab].name} ici…`}
            />
          </div>

          {/* Titre */}
          <Field label="Titre" ai={<AiFieldButton model={model} prompt={prompts.title} onResult={set('title')} disabled={!hasCode} stream={false} />}>
            <input
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-200"
              placeholder="Ex: Hook de debounce React"
            />
          </Field>

          {/* Catégorie */}
          <Field label="Catégorie" ai={<AiFieldButton model={model} prompt={prompts.category} onResult={(v) => {
            const clean = v.trim().toLowerCase()
            if (['component','script','utility'].includes(clean)) set('category')(clean)
          }} disabled={!hasCode} stream={false} />}>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-200 appearance-none"
            >
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <option key={key} value={key} className="bg-[#13131a]">{meta.label}</option>
              ))}
            </select>
          </Field>

          {/* Description */}
          <Field label="Description" ai={<AiFieldButton model={model} prompt={prompts.description} onResult={set('description')} disabled={!hasCode} />}>
            <textarea
              required
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-200 resize-none"
              placeholder="Courte description de l'utilité du code…"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags" ai={<AiFieldButton model={model} prompt={prompts.tags} onResult={set('tags')} disabled={!hasCode} stream={false} />}>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-200"
              placeholder="react, tailwind, animation"
            />
          </Field>

          {/* Notes */}
          <Field
            label="Notes"
            hint="utilisation, dépendances, exemples"
            ai={<AiFieldButton model={model} prompt={prompts.notes} onResult={set('notes')} disabled={!hasCode} />}
          >
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 outline-none text-slate-300 resize-none font-mono"
              placeholder="Généré par l'IA ou à remplir manuellement…"
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition disabled:opacity-50"
            >
              {loading ? 'Enregistrement…' : (initialData ? 'Enregistrer' : 'Créer le snippet')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Field({
  label, hint, ai, children,
}: {
  label: string
  hint?: string
  ai?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          {label}
          {hint && <span className="text-xs font-normal text-slate-600">{hint}</span>}
        </label>
        {ai}
      </div>
      {children}
    </div>
  )
}
