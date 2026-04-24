export type Language =
  | 'react'
  | 'typescript'
  | 'python'
  | 'bash'
  | 'powershell'
  | 'csharp'
  | 'sql'
  | 'dockerfile'
  | 'css'

export type Category = 'component' | 'script' | 'utility'

export interface Snippet {
  id: string
  title: string
  description: string
  language: Language
  category: Category
  tags: string[]
  code: string
  notes?: string | null
  createdAt: string
}
