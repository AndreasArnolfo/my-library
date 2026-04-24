'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, Check, X, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { fetchModels, DEFAULT_OLLAMA_URL } from '@/lib/ollama-client'

interface Props {
  currentUrl: string
  onSave: (url: string) => void
  available: boolean
}

export default function OllamaSettings({ currentUrl, onSave, available }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; models?: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setUrl(currentUrl) }, [currentUrl])

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    const models = await fetchModels(url.replace(/\/+$/, ''))
    setTestResult({ ok: models.length > 0, models: models.length })
    setTesting(false)
  }

  function handleSave() {
    onSave(url.replace(/\/+$/, ''))
    setOpen(false)
    setTestResult(null)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Configuration Ollama"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
        style={{
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          color: available ? '#4ade80' : '#ef4444',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {available ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span className="text-slate-500">Ollama</span>
        <Settings size={11} className="text-slate-600" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-3"
          style={{
            background: '#16161f',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-200">Configuration Ollama</span>
            <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">URL du serveur Ollama</label>
            <input
              value={url}
              onChange={e => { setUrl(e.target.value); setTestResult(null) }}
              onKeyDown={e => e.key === 'Enter' && handleTest()}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none font-mono"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
              }}
              placeholder="http://localhost:11434"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
            >
              {testing ? <Loader2 size={11} className="animate-spin" /> : <Wifi size={11} />}
              Tester
            </button>

            {testResult && (
              <span className="text-xs flex items-center gap-1" style={{ color: testResult.ok ? '#4ade80' : '#ef4444' }}>
                {testResult.ok
                  ? <><Check size={11} /> {testResult.models} modèle{(testResult.models ?? 0) > 1 ? 's' : ''} disponible{(testResult.models ?? 0) > 1 ? 's' : ''}</>
                  : <><X size={11} /> Serveur inaccessible</>
                }
              </span>
            )}
          </div>

          {/* Instructions CORS */}
          <div
            className="rounded-lg p-3 text-xs leading-relaxed"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#94a3b8' }}
          >
            <p className="font-medium text-indigo-400 mb-1">Depuis Vercel, lancer Ollama avec :</p>
            <code
              className="block font-mono text-slate-300 rounded px-2 py-1 mt-1 select-all"
              style={{ background: 'rgba(0,0,0,0.3)', fontSize: '10.5px' }}
            >
              OLLAMA_ORIGINS="*" ollama serve
            </code>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}
          >
            Enregistrer
          </button>
        </div>
      )}
    </div>
  )
}
