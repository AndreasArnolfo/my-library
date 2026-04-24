'use client'

import { useState, useEffect } from 'react'
import { fetchModels, getOllamaUrl, saveOllamaUrl } from '@/lib/ollama-client'

const MODEL_KEY = 'ollama:model'

export function useOllamaModel() {
  const [model, setModelState] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [ollamaUrl, setOllamaUrlState] = useState(getOllamaUrl)

  useEffect(() => {
    const stored = localStorage.getItem(MODEL_KEY) ?? ''
    fetchModels(ollamaUrl)
      .then((list) => {
        setModels(list)
        const active = stored && list.includes(stored) ? stored : (list[0] ?? '')
        setModelState(active)
        if (active) localStorage.setItem(MODEL_KEY, active)
      })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ollamaUrl])

  function setModel(m: string) {
    setModelState(m)
    localStorage.setItem(MODEL_KEY, m)
  }

  function updateOllamaUrl(url: string) {
    saveOllamaUrl(url)
    setOllamaUrlState(url)
    setIsLoading(true)
    setModels([])
  }

  return {
    model, models, isLoading,
    available: models.length > 0,
    setModel,
    ollamaUrl, updateOllamaUrl,
  }
}
