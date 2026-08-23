"use client"

import { useCallback, useRef, useState } from "react"
import {
  Sparkles,
  History,
  Sliders,
  ChevronDown,
  Check,
  FileCode2,
  Database,
  Server,
  FileText,
} from "lucide-react"
import { Select } from "@base-ui/react/select"
import { Switch } from "@base-ui/react/switch"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SiReact, SiNextdotjs, SiVuedotjs, SiSvelte } from "react-icons/si"
import {
  SiHono,
  SiNestjs,
  SiDjango,
  SiFastapi,
  SiPostgresql,
  SiMysql,
  SiMongodb,
} from "react-icons/si"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { detectPromptType, type PromptType } from "./mock-previews"

interface PromptPanelProps {
  onGenerate: (url: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onPromptType: (type: PromptType) => void
}

const MOCK_HISTORY = [
  {
    id: "1",
    prompt: "Build a SaaS inventory dashboard with Next.js and Postgres",
    timestamp: "1h ago",
    status: "success" as const,
  },
  {
    id: "2",
    prompt: "Create a landing page with Astro and Tailwind CSS",
    timestamp: "3h ago",
    status: "success" as const,
  },
  {
    id: "3",
    prompt: "Hono REST API with Redis caching layer",
    timestamp: "Yesterday",
    status: "failed" as const,
  },
  {
    id: "4",
    prompt: "E-commerce storefront with Vue 3 and Stripe integration",
    timestamp: "2 days ago",
    status: "success" as const,
  },
]

const EXAMPLE_PROMPTS = [
  {
    label: "SaaS Dashboard",
    description: "Inventory management with charts & analytics",
    prompt:
      "Build a SaaS inventory dashboard with Next.js, real-time charts, team collaboration, and Stripe billing integration",
    stack: { frontend: "nextjs", backend: "hono", database: "postgresql" },
  },
  {
    label: "AI Chat App",
    description: "Multi-model chat with streaming responses",
    prompt:
      "Create an AI-powered chat application with OpenAI/Claude integration, streaming responses, chat history, and file upload support",
    stack: { frontend: "nextjs", backend: "hono", database: "mongodb" },
  },
  {
    label: "E-Commerce Store",
    description: "Full-stack storefront with checkout",
    prompt:
      "Build a modern e-commerce storefront with product catalog, cart, Stripe checkout, and admin dashboard for order management",
    stack: { frontend: "nextjs", backend: "hono", database: "postgresql" },
  },
  {
    label: "REST API",
    description: "Production-ready API with auth & docs",
    prompt:
      "Build a production-ready REST API with JWT authentication, role-based access control, rate limiting, and auto-generated Swagger docs",
    stack: { frontend: "react", backend: "hono", database: "postgresql" },
  },
  {
    label: "Blog Platform",
    description: "CMS with markdown & SEO optimization",
    prompt:
      "Create a blog platform with markdown editor, SEO optimization, RSS feed, newsletter subscription, and comments system",
    stack: { frontend: "nextjs", backend: "nest", database: "mysql" },
  },
  {
    label: "Realtimecollab",
    description: "Multiplayer whiteboard & notes",
    prompt:
      "Build a real-time collaborative whiteboard with WebSocket, cursor presence, undo/redo, export to PNG, and room-based collaboration",
    stack: { frontend: "react", backend: "hono", database: "mongodb" },
  },
]

const FRONTEND_OPTIONS = [
  { value: "react", label: "React", Icon: SiReact },
  { value: "nextjs", label: "Next.js", Icon: SiNextdotjs },
  { value: "vue", label: "Vue", Icon: SiVuedotjs },
  { value: "svelte", label: "Svelte", Icon: SiSvelte },
]

const BACKEND_OPTIONS = [
  { value: "hono", label: "Hono", Icon: SiHono },
  { value: "nestjs", label: "NestJS", Icon: SiNestjs },
  { value: "django", label: "Django", Icon: SiDjango },
  { value: "fastapi", label: "FastAPI", Icon: SiFastapi },
]

const DATABASE_OPTIONS = [
  { value: "postgresql", label: "PostgreSQL", Icon: SiPostgresql },
  { value: "mysql", label: "MySQL", Icon: SiMysql },
  { value: "mongodb", label: "MongoDB", Icon: SiMongodb },
]

const MENTION_FILES = [
  {
    trigger: "@schema.prisma",
    label: "@schema.prisma",
    description: "Database schema",
    Icon: Database,
  },
  {
    trigger: "@api/routes.ts",
    label: "@api/routes.ts",
    description: "API routes",
    Icon: Server,
  },
  {
    trigger: "@components/ui/button.tsx",
    label: "@components/ui/button.tsx",
    description: "UI component",
    Icon: FileCode2,
  },
  {
    trigger: "@lib/auth.ts",
    label: "@lib/auth.ts",
    description: "Auth utilities",
    Icon: FileText,
  },
]

function StackSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string
  options: typeof FRONTEND_OPTIONS
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}) {
  const selected = options.find((o) => o.value === value)

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <Select.Root
        value={value}
        onValueChange={(val: string | null) => {
          if (val !== null) onChange(val)
        }}
        disabled={disabled}
      >
        <Select.Trigger
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full justify-between gap-2"
          )}
        >
          {selected && (
            <selected.Icon className="h-3.5 w-3.5 shrink-0" />
          )}
          <Select.Value placeholder={`Select ${label}`} />
          <Select.Icon className="ml-auto">
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4}>
            <Select.Popup className="z-50 max-h-60 w-(--anchor-width) overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground"
                >
                  <opt.Icon className="h-3.5 w-3.5 shrink-0" />
                  <Select.ItemText>{opt.label}</Select.ItemText>
                  <Select.ItemIndicator className="ml-auto">
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

function StackBadge({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-gradient-to-r ring-from-blue-500/40 ring-to-purple-500/40">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

export function PromptPanel({
  onGenerate,
  isLoading,
  setIsLoading,
  onPromptType,
}: PromptPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [frontend, setFrontend] = useState("nextjs")
  const [backend, setBackend] = useState("hono")
  const [database, setDatabase] = useState("postgresql")
  const [showHistory, setShowHistory] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [mockApi, setMockApi] = useState(true)
  const [enableAuth, setEnableAuth] = useState(false)
  const [generateTests, setGenerateTests] = useState(false)

  // @ mention state
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredMentions = MENTION_FILES.filter(
    (m) =>
      m.trigger.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      m.description.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      setPrompt(val)

      const cursorPos = e.target.selectionStart
      const textBeforeCursor = val.slice(0, cursorPos)
      const atIndex = textBeforeCursor.lastIndexOf("@")

      if (atIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(atIndex + 1)
        const hasSpace = textAfterAt.includes(" ")
        if (!hasSpace) {
          setShowMentions(true)
          setMentionFilter(textAfterAt)
          return
        }
      }
      setShowMentions(false)
      setMentionFilter("")
    },
    []
  )

  const insertMention = useCallback(
    (trigger: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const cursorPos = textarea.selectionStart
      const textBeforeCursor = prompt.slice(0, cursorPos)
      const textAfterCursor = prompt.slice(cursorPos)
      const atIndex = textBeforeCursor.lastIndexOf("@")

      if (atIndex === -1) return

      const newText =
        textBeforeCursor.slice(0, atIndex) + trigger + textAfterCursor
      setPrompt(newText)
      setShowMentions(false)
      setMentionFilter("")

      const newCursorPos = atIndex + trigger.length
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [prompt]
  )

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)
    setHasGenerated(true)

    setTimeout(() => {
      setIsLoading(false)
      onGenerate(`https://app.omnistack.dev/project-${Date.now()}`)
    }, 2500)
  }, [prompt, isLoading, setIsLoading, onGenerate])

  const handleRefactor = useCallback(() => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      onGenerate(`https://app.omnistack.dev/refactor-${Date.now()}`)
    }, 2000)
  }, [prompt, isLoading, setIsLoading, onGenerate])

  const handleHistoryClick = useCallback((item: (typeof MOCK_HISTORY)[0]) => {
    setPrompt(item.prompt)
    setShowHistory(false)
  }, [])

  const charCount = prompt.length

  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Architect
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowHistory((v) => !v)}
          className={cn(showHistory && "bg-muted text-foreground")}
          aria-label="Toggle prompt history"
        >
          <History className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Freedom Stack Builder */}
        <div className="border-b px-4 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Freedom Stack
          </p>
          <div className="grid grid-cols-3 gap-3">
            <StackSelect
              label="Frontend"
              options={FRONTEND_OPTIONS}
              value={frontend}
              onChange={setFrontend}
              disabled={isLoading}
            />
            <StackSelect
              label="Backend"
              options={BACKEND_OPTIONS}
              value={backend}
              onChange={setBackend}
              disabled={isLoading}
            />
            <StackSelect
              label="Database"
              options={DATABASE_OPTIONS}
              value={database}
              onChange={setDatabase}
              disabled={isLoading}
            />
          </div>

          {/* Active stack badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedStackBadges(frontend, backend, database).map((badge) => (
              <StackBadge
                key={badge.label}
                icon={badge.icon}
                label={badge.label}
              />
            ))}
          </div>
        </div>

        {/* Example Prompts */}
        <div className="border-b px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contoh Prompt
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Klik untuk auto-fill dan langsung generate.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex.label}
                disabled={isLoading}
                onClick={() => {
                  setPrompt(ex.prompt)
                  setFrontend(ex.stack.frontend)
                  setBackend(ex.stack.backend)
                  setDatabase(ex.stack.database)
                  onPromptType(detectPromptType(ex.prompt))
                }}
                className="flex flex-col items-start rounded-lg border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <span className="text-xs font-semibold">{ex.label}</span>
                <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {ex.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Prompt Input */}
        <div className="px-4 py-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe your application... Use @ to mention files (e.g., @schema.prisma)"
              rows={6}
              disabled={isLoading}
              className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
            />
            <span
              className={cn(
                "absolute bottom-2 right-2 text-xs tabular-nums",
                charCount > 500 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {charCount}
            </span>

            {/* @ mention dropdown */}
            {showMentions && filteredMentions.length > 0 && (
              <div className="absolute left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md">
                {filteredMentions.map((mention) => (
                  <button
                    key={mention.trigger}
                    onClick={() => insertMention(mention.trigger)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    <mention.Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-medium">
                        {mention.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {mention.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className={cn(
                "flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70",
                isLoading && "animate-pulse"
              )}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate App"}
            </Button>
            {hasGenerated && (
              <Button
                variant="outline"
                onClick={handleRefactor}
                disabled={!prompt.trim() || isLoading}
                className="flex-1"
              >
                Refactor / Iterate
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border-t px-4 py-4">
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full gap-2"
              )}
            >
              <Sliders className="h-4 w-4" />
              Advanced Settings
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Advanced Settings</SheetTitle>
                <SheetDescription>
                  Configure generation options for your project.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-5 px-4">
                <SettingToggle
                  label="Mock API Server"
                  description="Generate a mock API server with sample data for rapid prototyping."
                  checked={mockApi}
                  onCheckedChange={setMockApi}
                />
                <SettingToggle
                  label="Enable Auth (NextAuth)"
                  description="Include authentication setup with NextAuth.js and session management."
                  checked={enableAuth}
                  onCheckedChange={setEnableAuth}
                />
                <SettingToggle
                  label="Generate Unit Tests (Vitest)"
                  description="Scaffold Vitest configuration and sample test files for your components."
                  checked={generateTests}
                  onCheckedChange={setGenerateTests}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Prompt History */}
        {showHistory && (
          <div className="border-t px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recent Prompts
            </p>
            <div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto">
              {MOCK_HISTORY.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">
                      {item.prompt.length > 40
                        ? item.prompt.slice(0, 40) + "..."
                        : item.prompt}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === "success" ? "default" : "destructive"
                    }
                    className="shrink-0"
                  >
                    {item.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[checked]:bg-primary data-[unchecked]:bg-input"
      >
        <Switch.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[checked]:translate-x-4 data-[unchecked]:translate-x-0" />
      </Switch.Root>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}

function selectedStackBadges(
  frontend: string,
  backend: string,
  database: string
) {
  const fe = FRONTEND_OPTIONS.find((o) => o.value === frontend)
  const be = BACKEND_OPTIONS.find((o) => o.value === backend)
  const db = DATABASE_OPTIONS.find((o) => o.value === database)

  return [
    fe && { icon: fe.Icon, label: fe.label },
    be && { icon: be.Icon, label: be.label },
    db && { icon: db.Icon, label: db.label },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string }[]
}
