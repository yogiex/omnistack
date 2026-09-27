import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DangerZoneCard() {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base text-destructive">Zona Berbahaya</CardTitle>
        <CardDescription>
          Aksi permanen yang tidak dapat dibatalkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/*
          `disabled` karena flow hapus akun belum ada. Tombol yang terlihat
          aktif tapi mati lebih buruk daripada tidak ada — user akan
          mencoba dan mengira fiturnya rusak.
        */}
        <Button variant="destructive" className="w-full" disabled>
          <Trash2 />
          Hapus Akun
          <span className="ml-auto text-xs opacity-70">Segera</span>
        </Button>
      </CardContent>
    </Card>
  )
}
