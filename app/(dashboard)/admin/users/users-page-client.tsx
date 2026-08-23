"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MailCheck,
  MailX,
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
import {
  MOCK_USERS,
  getUserStatus,
  type MockUser,
  type Role,
  type UserStatus,
} from "@/lib/mock-data"
import { RoleBadge, InvitedBadge } from "./_components/role-badge"
import { StatsGrid } from "./_components/stats-grid"
import { InviteUserDialog } from "./_components/invite-user-dialog"
import { DeleteUserDialog } from "./_components/delete-user-dialog"
import { UsersEmptyState } from "./_components/empty-state"
import {
  UserFormSheet,
  EMPTY_USER_FORM,
  type UserForm,
} from "./user-form-sheet"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

type SortField = "name" | "email" | "createdAt" | "role"
type SortDir = "asc" | "desc"
type StatusFilter = "all" | UserStatus
type RoleFilter = "all" | Role

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Nama" },
  { value: "email", label: "Email" },
  { value: "createdAt", label: "Tanggal Gabung" },
  { value: "role", label: "Role" },
]

const ROLE_SORT: Record<Role, number> = { ADMIN: 0, USER: 1, VIEWER: 2 }

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: "Semua",
  active: "Active",
  suspended: "Suspended",
  invited: "Invited",
}

export function UsersPageClient() {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MockUser | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [twofaEnabledIds, setTwofaEnabledIds] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  const hasFilters =
    search.trim() !== "" || roleFilter !== "all" || statusFilter !== "all"

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const countActiveAdmins = (list: MockUser[]) =>
    list.filter(
      (u) =>
        u.role === "ADMIN" && u.isActive && getUserStatus(u) === "active"
    ).length

  const clearFilters = () => {
    setSearch("")
    setRoleFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

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

    if (statusFilter !== "all") {
      result = result.filter((u) => getUserStatus(u) === statusFilter)
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

  const openEdit = (user: MockUser) => {
    setSheetMode("edit")
    setEditingId(user.id)
    setForm({ name: user.name, email: user.email, role: user.role })
    setSheetOpen(true)
  }

  const handleSheetSubmit = () => {
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
      if (users.some((u) => u.email === form.email && u.id !== editingId)) {
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
    }

    setSheetOpen(false)
  }

  const handleInvite = (email: string, role: Role) => {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      showNotice("Gagal: email sudah terdaftar di sistem.")
      return
    }
    const now = new Date().toISOString()
    setUsers((prev) => [
      ...prev,
      {
        id: `user-invite-${Date.now()}`,
        email,
        password: "",
        name: email.split("@")[0],
        role,
        isActive: false,
        status: "invited",
        invitedAt: now,
        createdAt: now,
      },
    ])
    setInviteOpen(false)
    showNotice(`Undangan dikirim ke ${email} dengan role ${role} (mock).`)
  }

  const handleResendInvite = (target: MockUser) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === target.id ? { ...u, invitedAt: new Date().toISOString() } : u
      )
    )
    showNotice(`Undangan dikirim ulang ke ${target.email} (mock).`)
  }

  const handleCancelInvite = (target: MockUser) => {
    setUsers((prev) => prev.filter((u) => u.id !== target.id))
    showNotice(`Undangan untuk ${target.email} dibatalkan.`)
  }

  const handleToggleSuspend = (target: MockUser) => {
    if (
      target.role === "ADMIN" &&
      target.isActive &&
      countActiveAdmins(users) <= 1
    ) {
      showNotice("Gagal: tidak bisa menangguhkan ADMIN terakhir.")
      return
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === target.id
          ? { ...u, isActive: !u.isActive, status: undefined }
          : u
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

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (
      deleteTarget.role === "ADMIN" &&
      deleteTarget.isActive &&
      countActiveAdmins(users) <= 1
    ) {
      showNotice("Gagal: tidak bisa menghapus ADMIN terakhir.")
      setDeleteTarget(null)
      return
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    showNotice(`${deleteTarget.name} dihapus permanen.`)
    setDeleteTarget(null)
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
            Kelola user, role, dan undangan tim. Hanya ADMIN yang dapat mengakses.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserRoundPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {/* Stats */}
      <StatsGrid users={users} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
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
                  {SORT_OPTIONS.find((o) => o.value === sortField)?.label} (
                  {sortDir === "asc" ? "A-Z" : "Z-A"})
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
              {(["all", "active", "suspended", "invited"] as StatusFilter[]).map(
                (s) => (
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
                    {STATUS_FILTER_LABEL[s]}
                  </button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User list */}
      <Card>
        <CardHeader>
          <CardTitle>Semua User ({users.length})</CardTitle>
          <CardDescription>
            Kelola user aktif dan undangan pending. Kamu tidak bisa menghapus
            akunmu sendiri atau ADMIN terakhir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pagedUsers.map((user) => {
              const status = getUserStatus(user)
              const isSelf = currentUser?.email === user.email

              return (
                <div
                  key={user.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                    status !== "active" && "opacity-70"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar className={cn(status === "invited" && "opacity-60")}>
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : null}
                      <AvatarFallback>
                        {status === "invited" ? "?" : user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate font-medium",
                          status === "invited" && "italic text-muted-foreground"
                        )}
                      >
                        {user.name}
                        {isSelf && (
                          <span className="ml-2 text-xs not-italic text-muted-foreground">
                            (kamu)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <RoleBadge role={user.role} />
                    {status === "invited" && <InvitedBadge />}
                    {twofaEnabledIds.has(user.id) && (
                      <span className="rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[10px] text-green-500">
                        2FA
                      </span>
                    )}

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
                        {status === "invited" ? (
                          <>
                            <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                              <MailCheck className="mr-2 h-4 w-4" />
                              Kirim Ulang Undangan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancelInvite(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <MailX className="mr-2 h-4 w-4" />
                              Batalkan Undangan
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit / Ubah Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
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
                              onClick={() => setDeleteTarget(user)}
                              disabled={isSelf}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus Permanen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}

            {pagedUsers.length === 0 && (
              <UsersEmptyState
                hasFilters={hasFilters}
                searchQuery={search.trim() || undefined}
                onClearFilters={clearFilters}
              />
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

      {/* Dialogs & Sheets */}
      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
      <DeleteUserDialog
        user={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />
      <UserFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSheetSubmit}
      />
    </div>
  )
}
