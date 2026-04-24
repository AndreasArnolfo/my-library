import type { Language, Category } from './types'

export const LANGUAGE_META: Record<Language, { label: string; color: string; bg: string; prism: string; abbr: string }> = {
  react:      { label: 'React',       color: '#61dafb', bg: 'rgba(97,218,251,0.12)',   prism: 'tsx',        abbr: 'RX'  },
  typescript: { label: 'TypeScript',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   prism: 'typescript', abbr: 'TS'  },
  javascript: { label: 'JavaScript',  color: '#fcdc00', bg: 'rgba(252,220,0,0.12)',    prism: 'javascript', abbr: 'JS'  },
  python:     { label: 'Python',      color: '#facc15', bg: 'rgba(250,204,21,0.12)',   prism: 'python',     abbr: 'PY'  },
  bash:       { label: 'Bash',        color: '#4ade80', bg: 'rgba(74,222,128,0.12)',   prism: 'bash',       abbr: 'SH'  },
  powershell: { label: 'PowerShell',  color: '#818cf8', bg: 'rgba(129,140,248,0.12)',  prism: 'powershell', abbr: 'PS'  },
  csharp:     { label: 'C# / Blazor', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', prism: 'csharp',     abbr: 'C#'  },
  sql:        { label: 'SQL',         color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   prism: 'sql',        abbr: 'SQL' },
  dockerfile: { label: 'Docker',      color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',   prism: 'docker',     abbr: 'DK'  },
  css:        { label: 'CSS',         color: '#f472b6', bg: 'rgba(244,114,182,0.12)', prism: 'css',        abbr: 'CSS' },
  html:       { label: 'HTML',        color: '#e34f26', bg: 'rgba(227,79,38,0.12)',    prism: 'html',       abbr: 'HTM' },
}

export const CATEGORY_META: Record<Category, { label: string; icon: string }> = {
  component: { label: 'Composants', icon: '⬡' },
  script:    { label: 'Scripts',    icon: '⌨' },
  utility:   { label: 'Utilitaires', icon: '⚙' },
}
