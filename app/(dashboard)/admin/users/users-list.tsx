"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Crown,
  Eye,
  KeyRound,
  MoreVertical,
  Pencil,
  Search,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  SlidersHorizontal,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { MOCK_USERS, type MockUser, type Role } from "@/lib/mock-data"
import {
  UserFormSheet,
  EMPTY_USER_FORM,
  type UserForm,
} from "./user-form-sheet"
import { cn } from "@/lib/utils"

const ROLE_META: Record<
  Role,
  { icon: typeof Crown; label: string; color: string; bg: string }
> = {
  ADMIN: {
    icon: Crown,
    label: "ADMIN",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  USER: {
    icon: Code2,
    label: "USER",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  VIEWER: {
    icon: Eye,
    label: "VIEWER",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
}

const PAGE_SIZE = 10

type SortField = "name" | "email" | "createdAt" | "role"
type SortDir = "asc" | "desc"
type StatusFilter = "all" | "active" | "suspended"
type RoleFilter = "all" | Role

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Nama" },
  { value: "email", label: "Email" },
  { value: "createdAt", label: "Tanggal Gabung" },
  { value: "role", label: "Role" },
]

const ROLE_SORT: Record<Role, number> = { ADMIN: 0, USER: 1, VIEWER: 2 }

export function UsersList() {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [twofaEnabledIds, setTwofaEnabledIds] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const countActiveAdmins = (list: MockUser[]) =>
    list.filter((u) => u.role === "ADMIN" && u.isActive).length

  const filteredUsers = useMemo(() => {
    let result = [...users]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }

    if (statusFilter === "active") {
      result = result.filter((u) => u.isActive)
    } else if (statusFilter === "suspended") {
      result = result.filter((u) => !u.isActive)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField === "name") cmp = a.name.localeCompare(b.name)
      else if (sortField === "email") cmp = a.email.localeCompare(b.email)
      else if (sortField === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt)
      else if (sortField === "role") cmp = ROLE_SORT[a.role] - ROLE_SORT[b.role]
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [users, search, roleFilter, statusFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filteredUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredUsers.length)

  const openCreate = () => {
    setSheetMode("create")
    setEditingId(null)
    setForm(EMPTY_USER_FORM)
    setSheetOpen(true)
  }

  const openEdit = (user: MockUser) => {
    setSheetMode("edit")
    setEditingId(user.id)
    setForm({ name: user.name, email: user.email, role: user.role })
    setSheetOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.includes("@")) {
      showNotice("Nama dan email valid wajib diisi.")
      return
    }

    if (sheetMode === "edit" && editingId) {
      const target = users.find((u) => u.id === editingId)
      if (
        target?.role === "ADMIN" &&
        form.role !== "ADMIN" &&
        countActiveAdmins(users) <= 1
      ) {
        showNotice("Gagal: minimal harus ada 1 ADMIN aktif di sistem.")
        return
      }
      if (
        users.some((u) => u.email === form.email && u.id !== editingId)
      ) {
        showNotice("Email sudah dipakai user lain.")
        return
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? { ...u, name: form.name.trim(), email: form.email.trim(), role: form.role }
            : u
        )
      )
      showNotice(`Data ${form.name} diperbarui.`)
    } else {
      if (users.some((u) => u.email === form.email)) {
        showNotice("Email sudah terdaftar.")
        return
      }
      setUsers((prev) => [
        ...prev,
        {
          id: `user-local-${Date.now()}`,
          email: form.email.trim(),
          password: "demo1234",
          name: form.name.trim(),
          role: form.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ])
      showNotice(`User ${form.name} dibuat dengan role ${form.role}.`)
    }

    setSheetOpen(false)
    setConfirmDeleteId(null)
  }

  const handleToggleSuspend = (target: MockUser) => {
    if (target.role === "ADMIN" && target.isActive && countActiveAdmins(users) <= 1) {
      showNotice("Gagal: tidak bisa menangguhkan ADMIN terakhir.")
      return
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === target.id ? { ...u, isActive: !u.isActive } : u
      )
    )
    showNotice(
      target.isActive
        ? `${target.name} ditangguhkan (tidak bisa login).`
        : `${target.name} diaktifkan kembali.`
    )
  }

  const handleResetPassword = (target: MockUser) => {
    showNotice(`Email reset password dikirim ke ${target.email} (mock).`)
  }

  const handleToggle2FA = (target: MockUser) => {
    setTwofaEnabledIds((prev) => {
      const next = new Set(prev)
      if (next.has(target.id)) {
        next.delete(target.id)
      } else {
        next.add(target.id)
      }
      return next
    })
    showNotice(
      twofaEnabledIds.has(target.id)
        ? `2FA dinonaktifkan untuk ${target.name} (mock).`
        : `2FA diaktifkan untuk ${target.name} (mock).`
    )
  }

  const handleDelete = (target: MockUser) => {
    if (target.role === "ADMIN" && countActiveAdmins(users) <= 1) {
      showNotice("Gagal: tidak bisa menghapus ADMIN terakhir.")
      setConfirmDeleteId(null)
      return
    }
    setUsers((prev) => prev.filter((u) => u.id !== target.id))
    setConfirmDeleteId(null)
    showNotice(`${target.name} dihapus permanen.`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-7 w-7 text-primary" />
            User Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kelola user & role di sistem. Hanya ADMIN yang dapat mengakses halaman ini.
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserRoundPlus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search + Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {SORT_OPTIONS.find((o) => o.value === sortField)?.label} ({sortDir === "asc" ? "A-Z" : "Z-A"})
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  {SORT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        if (sortField === opt.value) {
                          setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                        } else {
                          setSortField(opt.value)
                          setSortDir("asc")
                        }
                        setPage(1)
                      }}
                    >
                      {opt.label}
                      {sortField === opt.value && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Role filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              {(["all", "ADMIN", "USER", "VIEWER"] as RoleFilter[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRoleFilter(r)
                    setPage(1)
                  }}
                  className={cn(
                    buttonVariants({
                      variant: roleFilter === r ? "outline" : "ghost",
                      size: "sm",
                    }),
                    roleFilter === r && "border-primary/50 font-medium"
                  )}
                >
                  {r === "all" ? "Semua" : r}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {(["all", "active", "suspended"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s)
                    setPage(1)
                  }}
                  className={cn(
                    buttonVariants({
                      variant: statusFilter === s ? "outline" : "ghost",
                      size: "sm",
                    }),
                    statusFilter === s && "border-primary/50 font-medium"
                  )}
                >
                  {s === "all" ? "Semua" : s === "active" ? "Active" : "Suspended"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User list */}
      <Card>
        <CardHeader>
          <CardTitle>Semua User ({users.length})</CardTitle>
          <CardDescription>
            Create, edit, ubah role, suspend, atau hapus user. Kamu tidak bisa
            menghapus akunmu sendiri.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pagedUsers.map((user) => {
              const meta = ROLE_META[user.role]
              const Icon = meta.icon
              const isSelf = currentUser?.email === user.email
              const isConfirmingDelete = confirmDeleteId === user.id

              return (
                <div
                  key={user.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                    !user.isActive && "opacity-60"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar>
                      {user.avatar && (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      )}
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {user.name}
                        {isSelf && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (kamu)
                          </span>
                        )}
                        {!user.isActive && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            Ditangguhkan
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className={cn("gap-1.5", meta.color)}>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                    {twofaEnabledIds.has(user.id) && (
                      <Badge
                        variant="outline"
                        className="text-[10px] text-green-500 border-green-500/40 bg-green-500/10"
                      >
                        2FA
                      </Badge>
                    )}

                    {isConfirmingDelete ? (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user)}
                        >
                          Ya, Hapus
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Batal
                        </Button>
                      </>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-sm transition-colors hover:bg-muted"
                          )}
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Aksi untuk {user.name}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit / Ubah Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user)}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleSuspend(user)}
                            disabled={isSelf}
                          >
                            {user.isActive ? (
                              <>
                                <ShieldBan className="mr-2 h-4 w-4" />
                                Suspend Akun
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Aktifkan Kembali
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggle2FA(user)}
                            disabled={isSelf}
                          >
                            {twofaEnabledIds.has(user.id) ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Disable 2FA
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Enable 2FA
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setConfirmDeleteId(user.id)}
                            disabled={isSelf}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Permanen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })}

            {pagedUsers.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada user yang cocok dengan filter.
              </p>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {rangeStart}–{rangeEnd} dari {filteredUsers.length} user
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
