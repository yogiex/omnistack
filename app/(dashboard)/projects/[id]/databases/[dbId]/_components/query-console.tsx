"use client"

import { useRef, useState } from "react"
import {
  Download,
  Loader2,
  Play,
  RotateCw,
  Save,
  Share2,
  TerminalSquare,
} from "lucide-react"
import type { MockDatabase } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface QueryResult {
  columns: string[]
  rows: Record<string, string | number>[]
  rowCount: number
  executionTime: number
}

interface HistoryEntry {
  timeLabel: string
  sql: string
  sqlPreview: string
  durationMs: number
}

const INITIAL_SQL = `SELECT u.id, u.email, COUNT(p.id) AS project_count
FROM users u
LEFT JOIN projects p ON p.owner_id = u.id
GROUP BY u.id, u.email
ORDER BY project_count DESC
LIMIT 20;`

function runMockQuery(sql: string): Promise<QueryResult> {
  const executionTime = 8 + (sql.length % 40)
  return new Promise((resolve) => {
    setTimeout(() => {
      if (/select.*from users/i.test(sql)) {
        resolve({
          columns: ["id", "email", "project_count"],
          rows: [
            { id: 1, email: "alice@example.com", project_count: 12 },
            { id: 2, email: "bob@example.com", project_count: 7 },
            { id: 3, email: "charlie@example.com", project_count: 3 },
          ],
          rowCount: 3,
          executionTime,
        })
        return
      }
      if (/show tables/i.test(sql)) {
        resolve({
          columns: ["table_name"],
          rows: [
            { table_name: "users" },
            { table_name: "projects" },
            { table_name: "deployments" },
          ],
          rowCount: 3,
          executionTime,
        })
        return
      }
      resolve({
        columns: ["kolom_1", "kolom_2"],
        rows: [
          { kolom_1: 1, kolom_2: "nilai_a" },
          { kolom_1: 2, kolom_2: "nilai_b" },
          { kolom_1: 3, kolom_2: "nilai_c" },
        ],
        rowCount: 3,
        executionTime,
      })
    }, 400)
  })
}

export function QueryConsole({ database }: { database: MockDatabase }) {
  const [sql, setSql] = useState(INITIAL_SQL)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [copied, setCopied] = useState(false)
  const gutterRef = useRef<HTMLDivElement>(null)

  const lineCount = sql.split("\n").length

  const run = (querySql: string) => {
    setRunning(true)
    runMockQuery(querySql).then((res) => {
      setResult(res)
      setRunning(false)
      setHistory((prev) =>
        [
          {
            timeLabel: new Date().toLocaleTimeString("id-ID"),
            sql: querySql,
            sqlPreview:
              querySql.length > 60 ? querySql.slice(0, 57) + "..." : querySql,
            durationMs: res.executionTime,
          },
          ...prev,
        ].slice(0, 5)
      )
    })
  }

  const handleRunClick = () => run(sql)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      run(sql)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  const handleExportCsv = () => {
    if (!result || result.rows.length === 0) return
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const lines = [
      result.columns.map(escape).join(","),
      ...result.rows.map((row) =>
        result.columns.map((c) => escape(row[c])).join(",")
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `query-${database.name}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    void navigator.clipboard.writeText(
      `https://omnistack.dev/console/${database.id}/query/shared`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <TerminalSquare className="h-5 w-5 text-muted-foreground" />
            Query Console — {database.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg border bg-muted">
            <div className="border-b px-3 py-1.5 font-mono text-xs text-muted-foreground">
              Query 1
            </div>
            <div className="flex">
              <div
                ref={gutterRef}
                aria-hidden="true"
                className="select-none overflow-hidden border-r border-border bg-background/50 px-3 py-3 text-right font-mono text-sm text-muted-foreground"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                aria-label="Editor SQL"
                className="h-64 flex-1 resize-none overflow-auto bg-transparent p-3 font-mono text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRunClick} disabled={running}>
              {running ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {running ? "Menjalankan..." : "Jalankan (Ctrl+Enter)"}
            </Button>
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Ekspor CSV
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              {copied ? "Tersalin!" : "Bagikan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {result
              ? `Hasil (${result.rowCount} baris, ${result.executionTime} ms)`
              : "Hasil"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {running ? (
            <p className="text-sm text-muted-foreground">Menjalankan query...</p>
          ) : result ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {result.columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row, i) => (
                  <TableRow key={i}>
                    {result.columns.map((col) => (
                      <TableCell key={col}>{row[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada hasil.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Query (5 terakhir)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {history.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Belum ada query yang dijalankan.
            </p>
          )}
          {history.map((entry, i) => (
            <div
              key={`${entry.timeLabel}-${i}`}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <code className="truncate font-mono">{entry.sqlPreview}</code>
              <span className="shrink-0 text-muted-foreground">
                {entry.timeLabel} — {entry.durationMs} ms
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Jalankan ulang"
                onClick={() => {
                  setSql(entry.sql)
                  run(entry.sql)
                }}
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
