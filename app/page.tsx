import Dashboard from '@/components/Dashboard'
import { getSnippets } from '@/app/actions/snippets'
import type { Snippet } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const result = await getSnippets()
  const snippets = result.success && result.data ? (result.data as unknown as Snippet[]) : []

  return <Dashboard initialSnippets={snippets} />
}
