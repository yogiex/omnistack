"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Eye,
  MonitorSmartphone,
  Settings,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/mock-data"

const PERMISSION_SUMMARY: Record<Role, string[]> = {
  ADMIN: [
    "Kelola semua user & role",
    "Akses semua proyek & deployment",
    "Lihat audit logs",
    "Ubah system settings",
  ],
  USER: [
    "CRUD proyek milik sendiri",
    "Deploy & rollback proyek sendiri",
    "Gunakan AI Architect",
    "Unduh laporan miliknya",
  ],
  VIEWER: [
    "Melihat dashboard & monitoring",
    "Membaca log deployment",
    "Unduh laporan FinOps",
    "Tidak ada aksi tulis apa pun",
  ],
}

export function SettingsClient() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [saved, setSaved] = useState(false)

  if (!user) return null

  const isViewer = user.role === "VIEWER"

  const handleSave = () => {
    // Mock save — di backend nyata ini PATCH /api/user
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings className="h-7 w-7 text-primary" />
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Kelola profil dan preferensi akun Anda.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Profil */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Informasi akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <Badge variant="outline" className="mt-1 gap-1.5 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Role: {user.role}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="settings-name">Nama Lengkap</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" value={user.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah pada mode demo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave}>Simpan Perubahan</Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-500">
                  <BadgeCheck className="h-4 w-4" />
                  Tersimpan
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hak akses + sesi */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Hak Akses Anda</CardTitle>
              <CardDescription>Ringkasan role {user.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {PERMISSION_SUMMARY[user.role].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                Sesi Aktif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>Browser ini · sesi mock via localStorage</p>
              <p>Login terakhir: baru saja</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                disabled={isViewer}
              >
                <Eye className="mr-2 h-4 w-4" />
                Kelola Sesi
                {isViewer && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Read-only
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
              <CardDescription>
                Aksi permanen yang tidak dapat dibatalkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Akun
                <span className="ml-auto text-xs opacity-70">Segera</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
