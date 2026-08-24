export interface IdeFileNode {
  name: string
  path: string
  type: "file" | "dir"
  language?: string
  children?: IdeFileNode[]
}

export const IDE_PROJECT_NAME = "acme-store"

export const IDE_BRANCH = "main"

export const IDE_NODE = {
  id: "hetzner-01",
  cpuPercent: 34,
  ramUsed: "128 MB",
  region: "SG",
}

export const IDE_FILE_TREE: IdeFileNode[] = [
  {
    name: "acme-store",
    path: "acme-store",
    type: "dir",
    children: [
      {
        name: "app",
        path: "acme-store/app",
        type: "dir",
        children: [
          {
            name: "api",
            path: "acme-store/app/api",
            type: "dir",
            children: [
              {
                name: "route.ts",
                path: "acme-store/app/api/route.ts",
                type: "file",
                language: "ts",
              },
            ],
          },
          {
            name: "components",
            path: "acme-store/app/components",
            type: "dir",
            children: [
              {
                name: "card.tsx",
                path: "acme-store/app/components/card.tsx",
                type: "file",
                language: "tsx",
              },
              {
                name: "navbar.tsx",
                path: "acme-store/app/components/navbar.tsx",
                type: "file",
                language: "tsx",
              },
            ],
          },
          {
            name: "page.tsx",
            path: "acme-store/app/page.tsx",
            type: "file",
            language: "tsx",
          },
        ],
      },
      {
        name: "lib",
        path: "acme-store/lib",
        type: "dir",
        children: [
          {
            name: "db.ts",
            path: "acme-store/lib/db.ts",
            type: "file",
            language: "ts",
          },
        ],
      },
      {
        name: ".env",
        path: "acme-store/.env",
        type: "file",
        language: "dotenv",
      },
      {
        name: "package.json",
        path: "acme-store/package.json",
        type: "file",
        language: "json",
      },
    ],
  },
]

export const IDE_CODE: Record<string, string[]> = {
  "acme-store/app/page.tsx": [
    'import { db } from "@/lib/db"',
    'import { Button } from "@/app/components/button"',
    "",
    "export default async function Page() {",
    '  const items = await db.items.findMany()',
    "",
    "  return (",
    '    <main className="p-6">',
    "      <h1 className=\"text-2xl font-bold\">Acme Store</h1>",
    "      <ul className=\"mt-4 space-y-2\">",
    "        {items.map((item) => (",
    '          <li key={item.id} className="rounded border p-3">',
    "            {item.name} — ${item.price}",
    "          </li>",
    "        ))}",
    "      </ul>",
    "    </main>",
    "  )",
    "}",
  ],
  "acme-store/lib/db.ts": [
    'import { PrismaClient } from "@prisma/client"',
    "",
    "const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }",
    "",
    "export const db =",
    "  globalForPrisma.prisma ??",
    "  new PrismaClient({ log: [\"query\", \"error\"] })",
    "",
    "if (process.env.NODE_ENV !== \"production\")",
    "  globalForPrisma.prisma = db",
  ],
  "acme-store/app/api/route.ts": [
    'import { NextResponse } from "next/server"',
    'import { db } from "@/lib/db"',
    "",
    "export async function GET() {",
    "  const items = await db.items.findMany()",
    "  return NextResponse.json(items)",
    "}",
  ],
  "acme-store/app/components/card.tsx": [
    'import { cn } from "@/lib/utils"',
    "",
    "interface CardProps {",
    "  className?: string",
    "  children: React.ReactNode",
    "}",
    "",
    "export function Card({ className, children }: CardProps) {",
    '  return <div className={cn("rounded-xl border p-4", className)}>',
    "    {children}",
    "  </div>",
    "}",
  ],
  "acme-store/app/components/navbar.tsx": [
    "export function Navbar() {",
    "  return (",
    '    <nav className="flex items-center justify-between px-6 py-4">',
    '      <span className="font-bold">Acme</span>',
    '      <a href="/cart" className="text-sm text-muted-foreground">Cart</a>',
    "    </nav>",
    "  )",
    "}",
  ],
  "acme-store/.env": [
    "DATABASE_URL=postgresql://acme:***REDACTED***@db.acme.omni:5432/acme",
    "NEXT_PUBLIC_API_URL=https://api.acme.omni.dev",
    "",
    "# Managed by Secrets Vault — read-only in editor",
  ],
  "acme-store/package.json": [
    "{",
    '  "name": "acme-store",',
    '  "scripts": {',
    '    "dev": "next dev"',
    "  },",
    '  "dependencies": {',
    '    "@prisma/client": "^5.0.0",',
    '    "next": "16.3.x",',
    '    "react": "^19.0.0"',
    "  }",
    "}",
  ],
}

export const IDE_OPEN_TABS: string[] = [
  "acme-store/app/page.tsx",
  "acme-store/lib/db.ts",
  "acme-store/package.json",
]

export const IDE_TERMINAL_LINES: string[] = [
  "$ npm run dev",
  "> acme-store@0.1.0 dev",
  "> next dev",
  "   ▲ Next.js 16.3.0 (Turbopack)",
  "   - Local:        http://localhost:3000",
  "   - Environments: .env",
  "   ✓ Compiled /app/page.tsx in 840ms",
  "   ⚡ HMR: /app/page.tsx updated (state preserved)",
  "   ✓ Ready in 1.2s",
]

export interface IdeProblem {
  severity: "error" | "warning"
  message: string
  path: string
  line: number
}

export const IDE_PROBLEMS: IdeProblem[] = [
  {
    severity: "warning",
    message: "Unused variable 'items'",
    path: "acme-store/app/page.tsx",
    line: 14,
  },
  {
    severity: "warning",
    message: "Consider using next/link for internal navigation",
    path: "acme-store/app/components/navbar.tsx",
    line: 6,
  },
  {
    severity: "error",
    message: "Cannot find module '@/app/components/button'",
    path: "acme-store/app/page.tsx",
    line: 1,
  },
]

export interface IdeMessage {
  role: "user" | "ai"
  text: string
}

export const IDE_AI_HISTORY: IdeMessage[] = [
  {
    role: "ai",
    text: "Halo! Saya AI Pilot. Jelaskan kode, atau minta saya generate/merefactor sesuatu untuk project ini.",
  },
]

export const IDE_AI_SUGGESTION = {
  files: [
    { path: "app/api/items/route.ts", status: "added" as const },
    { path: "lib/validators/item.ts", status: "added" as const },
    { path: "lib/db.ts", status: "modified" as const },
  ],
}

export interface PaletteAction {
  id: string
  label: string
  group: "RECENT" | "ACTIONS" | "AI"
  shortcut?: string
}

export const IDE_PALETTE: PaletteAction[] = [
  { id: "deploy-preview", label: "Deploy: Preview Environment", group: "RECENT", shortcut: "⇧⌘P" },
  { id: "ai-explain", label: "AI: Explain Selection", group: "RECENT", shortcut: "⌘E" },
  { id: "deploy-prod", label: "Deploy to Production…", group: "ACTIONS", shortcut: "⌘K" },
  { id: "preview-pr", label: "Create Preview Environment for PR #42", group: "ACTIONS" },
  { id: "change-stack", label: "Change Stack (AI auto-refactor)", group: "ACTIONS" },
  { id: "device-sim", label: "Open Device Simulator", group: "ACTIONS" },
  { id: "switch-branch", label: "Switch Branch → feature/auth", group: "ACTIONS" },
  { id: "ai-optimize", label: "Ask AI: optimize this query…", group: "AI" },
  { id: "ai-adr", label: "Ask AI: suggest architectural changes", group: "AI" },
]

export interface IdeMetrics {
  cpu: number
  ram: string
  p95: number
}

export const IDE_METRICS: IdeMetrics = {
  cpu: 42,
  ram: "128 MB",
  p95: 42,
}

export const DEPLOY_CHECKLIST = [
  { label: "Build passed", time: "12s", ok: true },
  { label: "SAST scan — 0 critical", ok: true },
  { label: "3 warnings", ok: false },
]
