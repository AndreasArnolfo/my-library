import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return NextResponse.json({ models: [] })
    const data = await res.json()
    return NextResponse.json({
      models: (data.models ?? []).map((m: { name: string }) => m.name),
    })
  } catch {
    return NextResponse.json({ models: [], error: 'Ollama non disponible' })
  }
}
