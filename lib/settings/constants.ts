import type { Role } from "@/lib/mock-data"

/**
 * Ringkasan hak akses per role. Dipisah ke `lib/` karena dipakai di dua
 * tempat (kartu profil + dokumentasi role di halaman admin) dan supaya
 * `settings-client.tsx` tidak menanggung data statis.
 *
 * Catatan: ini deskripsi UI, bukan enforcement. Yang benar-benar menahan
 * aksi tulis adalah guard di hook masing-masing (`canWrite`, `canManageProject`)
 * — `components/route-guard.tsx` masih client-side dan bisa dilewati.
 */
export const PERMISSION_SUMMARY: Record<Role, string[]> = {
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

export const ROLE_META: Record<
  Role,
  { label: string; description: string; tone: string }
> = {
  ADMIN: {
    label: "Administrator",
    description: "Akses penuh ke seluruh sistem",
    tone: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  USER: {
    label: "Developer",
    description: "Kelola proyek & deployment Anda",
    tone: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  VIEWER: {
    label: "Viewer",
    description: "Akses read-only untuk monitoring",
    tone: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
}

export const LANGUAGE_OPTIONS = [
  { value: "id", label: "Indonesia" },
  { value: "en", label: "English" },
] as const

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (UTC+7)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (UTC+8)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (UTC+9)" },
  { value: "UTC", label: "UTC (UTC+0)" },
] as const

export const THEME_OPTIONS = ["light", "dark", "system"] as const

export type ThemeOption = (typeof THEME_OPTIONS)[number]
