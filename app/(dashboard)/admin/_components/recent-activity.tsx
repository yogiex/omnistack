import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ActivityTone = "default" | "success" | "info"

interface ActivityItem {
  id: string
  text: string
  time: string
  tone: ActivityTone
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    text: "User baru registrasi: viewer@omnistack.dev",
    time: "10 menit lalu",
    tone: "info",
  },
  {
    id: "act-2",
    text: "Deploy sukses: AI Chatbot (deployment ke-12)",
    time: "1 jam lalu",
    tone: "success",
  },
  {
    id: "act-3",
    text: "Role ditetapkan: dev@omnistack.dev sebagai USER",
    time: "3 jam lalu",
    tone: "default",
  },
  {
    id: "act-4",
    text: "Node cluster selesai scaling (4 → 6 replica)",
    time: "5 jam lalu",
    tone: "info",
  },
  {
    id: "act-5",
    text: "Backup otomatis database produksi berhasil",
    time: "8 jam lalu",
    tone: "success",
  },
]

const TONE_DOT: Record<ActivityTone, string> = {
  default: "bg-muted-foreground/40",
  success: "bg-emerald-500",
  info: "bg-blue-500",
}

export function RecentActivity({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Aktivitas Terakhir</CardTitle>
        <CardDescription>Event sistem dalam 24 jam terakhir</CardDescription>
        <CardAction>
          <Link
            href="/admin/audit"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-muted-foreground hover:text-foreground"
            )}
          >
            Lihat Semua
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4">
          <span
            aria-hidden="true"
            className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px bg-border"
          />
          {ACTIVITIES.map((item) => (
            <li key={item.id} className="relative flex gap-4 pl-6">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1.5 size-2.5 rounded-full ring-4 ring-card",
                  TONE_DOT[item.tone]
                )}
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm leading-snug">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
