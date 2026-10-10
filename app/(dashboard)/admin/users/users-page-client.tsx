"use client"

import { useEffect, useRef, useState } from "react"

import { useNotice } from "@/hooks/use-notice"
import { useDebounce } from "@/hooks/use-debounce"
import { useAuth } from "@/lib/auth-context"
import type { MockUser, Role } from "@/lib/mock-data"

import { useUserFilters } from "./_hooks/use-user-filters"
import { useUsers } from "./_hooks/use-users"
import { useUserShortcuts } from "./_hooks/use-user-shortcuts"
import { BulkDeleteDialog } from "./_components/bulk-delete-dialog"
import { BulkRoleDialog } from "./_components/bulk-role-dialog"
import { DeleteUserDialog } from "./_components/delete-user-dialog"
import { InviteUserDialog } from "./_components/invite-user-dialog"
import { StatsGrid } from "./_components/stats-grid"
import type { UserRowHandlers } from "./_components/user-row"
import { UsersHeader } from "./_components/users-header"
import { UsersList } from "./_components/users-list"
import { UsersToolbar, type StatusFilterValue } from "./_components/users-toolbar"
import {
  EMPTY_USER_FORM,
  UserFormSheet,
  type UserForm,
} from "./user-form-sheet"

export function UsersPageClient() {
  const { user: currentUser } = useAuth()
  const { notice, showNotice } = useNotice()

  const {
    users,
    isSelf,
    has2FA,
    canSuspend,
    canDelete,
    canChangeRole,
    isLastActiveAdmin,
    emailExists,
    updateUser,
    invite,
    resendInvite,
    cancelInvite,
    toggleSuspend,
    toggle2FA,
    remove,
    bulkRemove,
    bulkUpdateRole,
  } = useUsers({ currentUserId: currentUser?.email })

  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 300)
  const filters = useUserFilters({ users })

  useEffect(() => {
    filters.setSearch(debouncedSearch)
  }, [debouncedSearch, filters])

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<UserForm>(EMPTY_USER_FORM)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MockUser | null>(null)
  const [bulkRoleOpen, setBulkRoleOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkRole, setBulkRole] = useState<Role>("USER")

  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useUserShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenInvite: () => setInviteOpen(true),
    onClearSearch: () => setSearchInput(""),
    searchInputRef,
  })

  const openEdit = (target: MockUser) => {
    setEditId(target.id)
    setForm({ name: target.name, email: target.email, role: target.role })
  }

  const submitEdit = () => {
    if (!editId) return

    const target = users.find((u) => u.id === editId)
    if (!target) {
      setEditId(null)
      return
    }

    if (!canChangeRole(target, form.role)) {
      showNotice("Gagal: minimal harus ada 1 ADMIN aktif di sistem.")
      return
    }

    if (emailExists(form.email, editId)) {
      showNotice("Email sudah dipakai user lain.")
      return
    }

    updateUser(editId, {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    })
    showNotice(`Data ${form.name} diperbarui.`)
    setEditId(null)
  }

  const handleInvite = (email: string, role: Role) => {
    if (emailExists(email)) {
      showNotice("Gagal: email sudah terdaftar di sistem.")
      return
    }
    invite(email, role)
    setInviteOpen(false)
    showNotice(`Undangan dikirim ke ${email} dengan role ${role} (mock).`)
  }

  const handleResetPassword = (target: MockUser) => {
    showNotice(`Email reset password dikirim ke ${target.email} (mock).`)
  }

  const handleToggle2FA = (target: MockUser) => {
    const wasEnabled = has2FA(target.id)
    toggle2FA(target.id)
    showNotice(
      `${wasEnabled ? "2FA dinonaktifkan" : "2FA diaktifkan"} untuk ${target.name} (mock).`,
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (!canDelete(deleteTarget)) {
      showNotice("Gagal: tidak bisa menghapus ADMIN terakhir atau akunmu sendiri.")
      setDeleteTarget(null)
      return
    }
    remove(deleteTarget.id)
    showNotice(`${deleteTarget.name} dihapus permanen.`)
    setDeleteTarget(null)
  }

  const handleBulkDelete = () => {
    const targets = users.filter((u) => selectedIds.has(u.id))
    const deletable = targets.filter((u) => canDelete(u))
    if (deletable.length === 0) {
      showNotice("Gagal: tidak ada user yang bisa dipilih untuk dihapus.")
      return
    }
    bulkRemove(deletable.map((u) => u.id))
    setSelectedIds(new Set())
    setBulkDeleteOpen(false)
    showNotice(`${deletable.length} user dihapus permanen.`)
  }

  const handleBulkRole = () => {
    const targets = users.filter((u) => selectedIds.has(u.id))
    const changed = targets.map((u) => {
      if (canChangeRole(u, bulkRole)) return u.id
      return null
    }).filter((id): id is string => id !== null)

    if (changed.length === 0) {
      showNotice("Gagal: minimal harus ada 1 ADMIN aktif di sistem.")
      return
    }

    bulkUpdateRole(changed, bulkRole)
    setSelectedIds(new Set())
    setBulkRoleOpen(false)
    showNotice(`${changed.length} user diubah ke role ${bulkRole}.`)
  }

  const handlers: UserRowHandlers = {
    onEdit: openEdit,
    onResendInvite: (target) => {
      resendInvite(target.id)
      showNotice(`Undangan dikirim ulang ke ${target.email} (mock).`)
    },
    onCancelInvite: (target) => {
      cancelInvite(target.id)
      showNotice(`Undangan untuk ${target.email} dibatalkan.`)
    },
    onToggleSuspend: (target) => {
      if (!canSuspend(target)) {
        showNotice("Gagal: tidak bisa menangguhkan ADMIN terakhir atau akunmu sendiri.")
        return
      }
      toggleSuspend(target.id)
      showNotice(
        target.isActive
          ? `${target.name} ditangguhkan (tidak bisa login).`
          : `${target.name} diaktifkan kembali.`,
      )
    },
    onResetPassword: handleResetPassword,
    onToggle2FA: handleToggle2FA,
    onRequestDelete: (target) => {
      if (!canDelete(target)) {
        showNotice("Gagal: tidak bisa menghapus ADMIN terakhir atau akunmu sendiri.")
        return
      }
      setDeleteTarget(target)
    },
  }

  return (
    <div className="flex flex-col gap-6">
      <UsersHeader onInvite={() => setInviteOpen(true)} />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
        >
          {notice}
        </div>
      )}

      <StatsGrid users={users} />

      <UsersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        roleFilter={filters.roleFilter}
        onRoleFilterChange={filters.setRoleFilter}
        statusFilter={filters.statusFilter as StatusFilterValue}
        onStatusFilterChange={(v) => filters.setStatusFilter(v as typeof filters.statusFilter)}
        onResetFilters={filters.clearFilters}
        hasActiveFilters={filters.hasFilters}
        sortField={filters.sortField}
        sortDir={filters.sortDir}
        onToggleSort={filters.toggleSort}
        selectedCount={selectedIds.size}
        onBulkChangeRole={() => setBulkRoleOpen(true)}
        onBulkDelete={() => setBulkDeleteOpen(true)}
        onClearSelection={() => setSelectedIds(new Set())}
        searchInputRef={searchInputRef}
      />

      <UsersList
        users={filters.paged}
        totalCount={users.length}
        page={filters.currentPage}
        totalPages={filters.totalPages}
        rangeStart={filters.rangeStart}
        rangeEnd={filters.rangeEnd}
        hasFilters={filters.hasFilters}
        searchQuery={searchInput.trim() || undefined}
        isSelf={isSelf}
        has2FA={has2FA}
        canSuspend={canSuspend}
        canDelete={canDelete}
        handlers={handlers}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onClearFilters={filters.clearFilters}
        onPrev={() => filters.setPage((p) => Math.max(1, p - 1))}
        onNext={() =>
          filters.setPage((p) => Math.min(filters.totalPages, p + 1))
        }
      />

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
        isEmailTaken={emailExists}
      />

      <DeleteUserDialog
        user={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
      />

      <BulkRoleDialog
        open={bulkRoleOpen}
        onOpenChange={setBulkRoleOpen}
        selectedCount={selectedIds.size}
        currentRole={bulkRole}
        onRoleChange={setBulkRole}
        onConfirm={handleBulkRole}
        isLastActiveAdmin={isLastActiveAdmin(users[0])}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkDelete}
      />

      <UserFormSheet
        open={editId !== null}
        onOpenChange={(open) => {
          if (!open) setEditId(null)
        }}
        form={form}
        onFormChange={setForm}
        onSubmit={submitEdit}
        isLastActiveAdmin={
          editId
            ? isLastActiveAdmin(users.find((u) => u.id === editId) ?? users[0])
            : false
        }
      />
    </div>
  )
}
