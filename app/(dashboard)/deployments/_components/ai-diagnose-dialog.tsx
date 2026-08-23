"use client"

import { useState } from "react"
import {
  Bug,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AIDiagnoseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deploymentId: string
  errorMessage: string
}

export function AIDiagnoseDialog({
  open,
  onOpenChange,
  deploymentId,
  errorMessage,
}: AIDiagnoseDialogProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{
    rootCause: string
    fix: string
    impact: string
  } | null>(null)

  const handleAnalyze = () => {
    setAnalyzing(true)
    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false)
      setResult({
        rootCause:
          "Versi `react` di-upgrade ke 19.1.0 tetapi `react-dom` masih di versi 18.3.1. Kedua package ini harus selalu menggunakan versi yang sama.",
        fix: "npm install react@18.3.1 react-dom@18.3.1",
        impact:
          "React 19 memiliki breaking changes di `useRef`, `forwardRef`, dan Context API. 12 komponen di project ini menggunakan `forwardRef`.",
      })
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-destructive" />
            AI Diagnose — {deploymentId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Summary */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="text-sm font-medium text-destructive">
              Error Summary
            </h4>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {errorMessage || "Build failed at step 3 — npm ci exit code 1"}
            </p>
          </div>

          {!result && !analyzing && (
            <Button onClick={handleAnalyze} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze with AI
            </Button>
          )}

          {analyzing && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing error...
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  Root Cause
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.rootCause}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  Recommended Fix
                </h4>
                <div className="mt-2 flex items-center gap-2 rounded bg-muted p-2 font-mono text-xs">
                  <code className="flex-1">{result.fix}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(result.fix)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  Impact Analysis
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.impact}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    navigator.clipboard.writeText(result.fix)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Fix Command
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Create Issue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
