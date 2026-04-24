import type { Snippet } from './types'

export const SNIPPETS: Snippet[] = [
  {
    id: '1',
    title: 'useDebounce Hook',
    description: 'Retarde la mise à jour d\'une valeur jusqu\'à ce que l\'utilisateur arrête de taper.',
    language: 'react',
    category: 'component',
    tags: ['hook', 'performance', 'input'],
    createdAt: '2024-01-15',
    code: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}`,
  },
  {
    id: '2',
    title: 'useLocalStorage Hook',
    description: 'Persiste et synchronise un état React avec le localStorage du navigateur.',
    language: 'react',
    category: 'component',
    tags: ['hook', 'storage', 'persistence'],
    createdAt: '2024-01-20',
    code: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}`,
  },
  {
    id: '3',
    title: 'Generic API Fetch',
    description: 'Utilitaire TypeScript typé pour les appels API avec gestion d\'erreur.',
    language: 'typescript',
    category: 'utility',
    tags: ['fetch', 'api', 'async', 'generic'],
    createdAt: '2024-02-03',
    code: `export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number }

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    if (!res.ok) {
      return { ok: false, error: await res.text(), status: res.status }
    }

    const data: T = await res.json()
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: String(err), status: 0 }
  }
}`,
  },
  {
    id: '4',
    title: 'Git Auto-Backup',
    description: 'Sauvegarde automatique d\'un dossier vers un repo Git distant avec timestamp.',
    language: 'bash',
    category: 'script',
    tags: ['git', 'backup', 'automation', 'cron'],
    createdAt: '2024-02-10',
    code: `#!/bin/bash
set -euo pipefail

REPO_DIR="\${1:?Usage: $0 <repo_dir>}"
REMOTE="\${2:-origin}"
BRANCH="\${3:-main}"

cd "$REPO_DIR"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "Nothing to commit."
  exit 0
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

git add -A
git commit -m "chore: auto-backup $TIMESTAMP"
git push "$REMOTE" "$BRANCH"

echo "✓ Backup pushed to $REMOTE/$BRANCH"`,
  },
  {
    id: '5',
    title: 'Docker Cleanup',
    description: 'Nettoie les conteneurs arrêtés, images orphelines et volumes inutilisés.',
    language: 'bash',
    category: 'script',
    tags: ['docker', 'cleanup', 'devops'],
    createdAt: '2024-02-18',
    code: `#!/bin/bash
set -euo pipefail

echo "=== Docker Cleanup ==="

echo "→ Stopping all containers..."
docker ps -q | xargs -r docker stop

echo "→ Removing stopped containers..."
docker container prune -f

echo "→ Removing dangling images..."
docker image prune -f

echo "→ Removing unused volumes..."
docker volume prune -f

echo "→ Removing unused networks..."
docker network prune -f

echo ""
echo "✓ Done. Space reclaimed:"
docker system df`,
  },
  {
    id: '6',
    title: 'Disk Usage Report',
    description: 'Rapport PowerShell des disques avec alertes si espace < seuil configurable.',
    language: 'powershell',
    category: 'script',
    tags: ['disk', 'monitoring', 'alert', 'sysadmin'],
    createdAt: '2024-03-01',
    code: `param(
  [int]$ThresholdPercent = 80
)

$drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null }

foreach ($drive in $drives) {
  $total = $drive.Used + $drive.Free
  $usedPct = [math]::Round(($drive.Used / $total) * 100, 1)
  $status = if ($usedPct -ge $ThresholdPercent) { "⚠ ALERT" } else { "✓ OK" }

  Write-Host "$status  $($drive.Name):  $usedPct% used  ($([math]::Round($drive.Free/1GB,1)) GB free)"
}`,
  },
  {
    id: '7',
    title: 'Blazor Toast Service',
    description: 'Service de notifications toast injectable avec types Success/Error/Info/Warning.',
    language: 'csharp',
    category: 'component',
    tags: ['blazor', 'notification', 'service', 'DI'],
    createdAt: '2024-03-12',
    code: `public enum ToastType { Success, Error, Warning, Info }

public record ToastMessage(string Text, ToastType Type, Guid Id = default)
{
  public Guid Id { get; } = Id == default ? Guid.NewGuid() : Id;
}

public class ToastService
{
  public event Action<ToastMessage>? OnToast;

  public void Show(string text, ToastType type = ToastType.Info)
    => OnToast?.Invoke(new ToastMessage(text, type));

  public void Success(string text) => Show(text, ToastType.Success);
  public void Error(string text)   => Show(text, ToastType.Error);
  public void Warning(string text) => Show(text, ToastType.Warning);
}`,
  },
  {
    id: '8',
    title: 'Pagination SQL',
    description: 'Requête SQL de pagination avec comptage total en une seule passe (window function).',
    language: 'sql',
    category: 'utility',
    tags: ['pagination', 'performance', 'window-function'],
    createdAt: '2024-03-20',
    code: `-- @page     = numéro de page (1-based)
-- @pageSize = nombre de lignes par page

SELECT
  id,
  title,
  created_at,
  COUNT(*) OVER() AS total_count
FROM articles
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT :pageSize
OFFSET (:page - 1) * :pageSize;`,
  },
  {
    id: '9',
    title: 'Python Env Checker',
    description: 'Vérifie que toutes les variables d\'environnement requises sont définies au démarrage.',
    language: 'python',
    category: 'utility',
    tags: ['env', 'config', 'validation', 'startup'],
    createdAt: '2024-04-05',
    code: `import os
import sys

REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "SECRET_KEY",
    "API_BASE_URL",
]

def check_env() -> None:
    missing = [v for v in REQUIRED_ENV_VARS if not os.getenv(v)]
    if missing:
        print(f"[ERROR] Missing env vars: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    check_env()
    print("✓ All environment variables are set.")`,
  },
  {
    id: '10',
    title: 'Docker Compose Web Stack',
    description: 'Template Docker Compose avec Nginx, app Node, et base de données PostgreSQL.',
    language: 'dockerfile',
    category: 'utility',
    tags: ['docker', 'nginx', 'postgres', 'template'],
    createdAt: '2024-04-15',
    code: `version: '3.9'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app

  app:
    build: .
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/mydb
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 5s
      retries: 5

volumes:
  pgdata:`,
  },
  {
    id: '11',
    title: 'Glassmorphism Card',
    description: 'Composant CSS card avec effet glassmorphism, gradient border et dark mode.',
    language: 'css',
    category: 'component',
    tags: ['glassmorphism', 'card', 'dark-mode', 'design'],
    createdAt: '2024-04-22',
    code: `.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}`,
  },
  {
    id: '12',
    title: 'Watch & Restart Script',
    description: 'Surveille un fichier ou dossier et relance une commande à chaque modification.',
    language: 'bash',
    category: 'script',
    tags: ['watch', 'inotify', 'dev', 'automation'],
    createdAt: '2024-05-01',
    code: `#!/bin/bash
# Requires: inotify-tools (apt install inotify-tools)
set -euo pipefail

WATCH_PATH="\${1:?Usage: $0 <path> <command...>}"
shift
COMMAND=("$@")

echo "Watching: $WATCH_PATH"
echo "Command:  \${COMMAND[*]}"
echo "---"

"\${COMMAND[@]}" &
PID=$!

inotifywait -m -r -e modify,create,delete,move "$WATCH_PATH" --format '%e %w%f' |
while read -r event file; do
  echo "→ $event: $file"
  kill "$PID" 2>/dev/null
  wait "$PID" 2>/dev/null || true
  "\${COMMAND[@]}" &
  PID=$!
done`,
  },
]
