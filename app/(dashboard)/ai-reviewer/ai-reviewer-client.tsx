"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronDown,
  FileCode,
  History,
  Info,
  Loader2,
  ShieldAlert,
  Terminal,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Severity = "Critical" | "Warning" | "Info"

interface ReviewFinding {
  line: number
  severity: Severity
  message: string
  suggestion: string
}

interface ReviewResult {
  language: string
  findings: ReviewFinding[]
  summary: { critical: number; warning: number; info: number }
}

const LANGUAGES = ["TypeScript", "Python", "Go", "Rust"] as const

const MOCK_FINDINGS: Record<string, ReviewFinding[]> = {
  TypeScript: [
    { line: 12, severity: "Critical", message: "Potensi SQL injection — query tidak di-parameterize", suggestion: "Gunakan parameterized query atau ORM seperti Prisma" },
    { line: 28, severity: "Warning", message: "Tipe `any` digunakan pada parameter fungsi", suggestion: "Ganti dengan tipe spesifik atau gunakan generic" },
    { line: 45, severity: "Info", message: "Promise tanpa error handling", suggestion: "Tambahkan try-catch atau .catch() handler" },
    { line: 67, severity: "Warning", message: "Variabel `user` mungkin undefined", suggestion: "Tambahkan null check sebelum akses property" },
  ],
  Python: [
    { line: 8, severity: "Critical", message: "eval() pada input user — Remote Code Execution", suggestion: "Hapus eval() dan gunakan ast.literal_eval() atau validasi manual" },
    { line: 23, severity: "Warning", message: "Import wildcard (*) — namespace pollution", suggestion: "Import modul spesifik: from module import ClassA, function_b" },
    { line: 41, severity: "Info", message: "Fungsi tidak punya type hints", suggestion: "Tambahkan type hints untuk dokumentasi dan IDE support" },
  ],
  Go: [
    { line: 15, severity: "Critical", message: "Error return value tidak di-check", suggestion: "Selalu check error: if err != nil { return err }" },
    { line: 33, severity: "Warning", message: "Goroutine tanpa sync.WaitGroup", suggestion: "Gunakan WaitGroup atau context untuk menunggu goroutine selesai" },
    { line: 52, severity: "Info", message: "Komentar exported function kosong", suggestion: "Tambahkan godoc: // FunctionName does X because Y" },
  ],
  Rust: [
    { line: 10, severity: "Critical", message: "unwrap() pada None/Err — potential panic", suggestion: "Gunakan match atau if let untuk handle None/Err" },
    { line: 27, severity: "Warning", message: "Clone() berlebihan pada data besar", suggestion: "Gunakan reference (&T) atau Cow untuk menghindari clone" },
    { line: 44, severity: "Info", message: "Unused mut keyword", suggestion: "Hapus mut jika variabel tidak di-mutate" },
    { line: 58, severity: "Warning", message: "Unsafe block tanpa komentar justifikasi", suggestion: "Tambahkan SAFETY: komentar menjelaskan mengapa unsafe diperlukan" },
  ],
}

const MOCK_STREAM_STEPS: Record<string, string[]> = {
  TypeScript: [
    "Parsing TypeScript AST...",
    "Menganalisis tipe data & generic...",
    "Memeriksa SQL query patterns...",
    "Scanning error handling...",
    "Evaluasi best practices...",
    "Review selesai — 4 findings",
  ],
  Python: [
    "Parsing Python AST...",
    "Menganalisis import patterns...",
    "Memeriksa fungsi berbahaya (eval/exec)...",
    "Scanning type hints coverage...",
    "Review selesai — 3 findings",
  ],
  Go: [
    "Parsing Go AST...",
    "Menganalisis error handling...",
    "Memeriksa goroutine safety...",
    "Scanning godoc comments...",
    "Review selesai — 3 findings",
  ],
  Rust: [
    "Parsing Rust AST...",
    "Menganalisis ownership & borrowing...",
    "Memeriksa unsafe blocks...",
    "Scanning unwrap() calls...",
    "Review selesai — 4 findings",
  ],
}

const REVIEW_HISTORY = [
  { language: "TypeScript", snippet: "export async function getUser(id: string) {...}", findings: 4, timeLabel: "5 menit lalu" },
  { language: "Python", snippet: "def process_data(raw_input): eval(raw_input)...", findings: 3, timeLabel: "1 jam lalu" },
  { language: "Go", snippet: "func fetchData(ctx context.Context) { go func() {...} }", findings: 3, timeLabel: "3 jam lalu" },
]

const SEVERITY_CONFIG: Record<Severity, { icon: typeof ShieldAlert; color: string; bg: string }> = {
  Critical: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  Warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  Info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
}

export function AiReviewerClient() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState<string>("TypeScript")
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startReview = () => {
    if (!code.trim() || isRunning) return

    setIsRunning(true)
    setIsDone(false)
    setVisibleSteps(0)
    setResult(null)

    const steps = MOCK_STREAM_STEPS[language]
    let step = 0
    intervalRef.current = setInterval(() => {
      step += 1
      setVisibleSteps(step)

      if (step >= steps.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsRunning(false)
        setIsDone(true)

        const findings = MOCK_FINDINGS[language]
        const summary = {
          critical: findings.filter((f) => f.severity === "Critical").length,
          warning: findings.filter((f) => f.severity === "Warning").length,
          info: findings.filter((f) => f.severity === "Info").length,
        }
        setResult({ language, findings, summary })
      }
    }, 600)
  }

  const resetReview = () => {
    setIsRunning(false)
    setIsDone(false)
    setVisibleSteps(0)
    setResult(null)
  }

  const steps = MOCK_STREAM_STEPS[language]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Brain className="h-7 w-7 text-primary" />
          AI Code Reviewer
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tempel kode Anda — AI akan menganalisis keamanan, kualitas, dan best practices
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Kode Sumber
              </CardTitle>
              <CardDescription>Tempel kode yang ingin di-review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isRunning}
                  className="flex h-9 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-ring disabled:opacity-50"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Tempel kode ${language} Anda di sini...`}
                rows={12}
                disabled={isRunning}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring disabled:opacity-50"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {code.split("\n").filter(Boolean).length} baris
                </span>
                <div className="flex gap-2">
                  {(isRunning || isDone) && (
                    <Button variant="outline" size="sm" onClick={resetReview}>
                      <X className="mr-2 h-3.5 w-3.5" />
                      Reset
                    </Button>
                  )}
                  <Button onClick={startReview} disabled={isRunning || !code.trim()}>
                    {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isRunning ? "Menganalisis..." : "Review Kode"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-muted-foreground" />
                Riwayat Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {REVIEW_HISTORY.map((item) => (
                <div key={item.timeLabel} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {item.language}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.findings} findings
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.timeLabel}
                    </span>
                  </div>
                  <code className="mt-1 line-clamp-1 block font-mono text-xs text-muted-foreground">
                    {item.snippet}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-zinc-800 bg-zinc-950 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <Terminal className="h-3 w-3" />
              omnistack-code-reviewer
            </div>
          </div>

          <CardContent className="min-h-[320px] space-y-2 pt-4 font-mono text-xs">
            {visibleSteps === 0 && !isRunning && (
              <p className="text-zinc-600">
                $ Menunggu kode... tempel kode Anda lalu klik Review.
              </p>
            )}

            {steps.slice(0, visibleSteps).map((step) => (
              <div key={step} className="flex items-start gap-2">
                <span className="text-blue-400">→</span>
                <span className="text-zinc-300">{step}</span>
                <Check className="ml-auto h-3 w-3 shrink-0 text-green-500" />
              </div>
            ))}

            {isRunning && (
              <div className="flex items-start gap-2">
                <span className="animate-pulse text-blue-400">▋</span>
              </div>
            )}

            {isDone && result && (
              <div className="mt-4 space-y-4 border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-green-400">
                    ✓ Review selesai — {result.findings.length} findings
                  </p>
                  <div className="flex gap-2">
                    {result.summary.critical > 0 && (
                      <Badge variant="outline" className="border-red-500/40 font-mono text-red-400">
                        {result.summary.critical} Critical
                      </Badge>
                    )}
                    {result.summary.warning > 0 && (
                      <Badge variant="outline" className="border-yellow-500/40 font-mono text-yellow-400">
                        {result.summary.warning} Warning
                      </Badge>
                    )}
                    {result.summary.info > 0 && (
                      <Badge variant="outline" className="border-blue-500/40 font-mono text-blue-400">
                        {result.summary.info} Info
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {result.findings.map((finding) => {
                    const config = SEVERITY_CONFIG[finding.severity]
                    const Icon = config.icon
                    return (
                      <div
                        key={`${finding.line}-${finding.severity}`}
                        className={`rounded-lg border border-zinc-800 p-3 ${config.bg}`}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                                {finding.severity}
                              </Badge>
                              <span className="text-zinc-500">Baris {finding.line}</span>
                            </div>
                            <p className="mt-1 text-zinc-300">{finding.message}</p>
                            <p className="mt-1 text-zinc-500">
                              💡 {finding.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
