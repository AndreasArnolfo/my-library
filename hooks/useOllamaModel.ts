'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ollama:model'

export function useOllamaModel() {
  const [model, setModelState] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) ?? ''
    fetch('/api/ollama/models')
      .then((r) => r.json())
      .then((data: { models: string[] }) => {
        const list = data.models ?? []
        setModels(list)
        const active = stored && list.includes(stored) ? stored : (list[0] ?? '')
        setModelState(active)
        if (active) localStorage.setItem(STORAGE_KEY, active)
      })
      .catch(() => setModels([]))
      .finally(() => setIsLoading(false))
  }, [])

  function setModel(m: string) {
    setModelState(m)
    localStorage.setItem(STORAGE_KEY, m)
  }

  return { model, models, isLoading, available: models.length > 0, setModel }
}
