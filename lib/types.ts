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
  | 'html'
  | 'javascript'

export type Category = 'component' | 'script' | 'utility'

export interface CodeTab {
  name: string
  language: string
  code: string
}

export interface Snippet {
  id: string
  title: string
  description: string
  language: Language
  category: Category
  tags: string[]
  code: string
  tabs?: CodeTab[] | null
  notes?: string | null
  createdAt: string
}
