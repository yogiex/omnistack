// ==================== TIPE DASAR ====================

export type Role = "ADMIN" | "USER" | "VIEWER"

export interface MockUser {
  id: string
  email: string
  password: string
  name: string
  role: Role
  avatar?: string
  isActive: boolean
  createdAt: string
}

/** User tanpa kredensial — aman disimpan di localStorage & dipakai lintas komponen */
export type SessionUser = Omit<MockUser, "password">

export type ProjectStatus = "active" | "inactive" | "deploying"

export interface MockProject {
  id: string
  name: string
  description: string
  status: ProjectStatus
  userId: string
  createdAtLabel: string
  deployments: number
}

export type DeploymentStatus = "success" | "building" | "failed" | "queued"

export interface MockDeployment {
  id: string
  projectId: string
  branch: string
  commitMessage: string
  status: DeploymentStatus
  triggeredBy: string
  timeLabel: string
  durationLabel?: string
  logLines: string[]
}

// ==================== MOCK USERS (3 test accounts) ====================

export const MOCK_USERS: MockUser[] = [
  {
    id: "user-admin-001",
    email: "admin@omnistack.dev",
    password: "admin123",
    name: "Admin OmniStack",
    role: "ADMIN",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    isActive: true,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "user-dev-002",
    email: "dev@omnistack.dev",
    password: "dev123",
    name: "Developer OmniStack",
    role: "USER",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev",
    isActive: true,
    createdAt: "2026-02-20T14:30:00Z",
  },
  {
    id: "user-viewer-003",
    email: "viewer@omnistack.dev",
    password: "viewer123",
    name: "Viewer OmniStack",
    role: "VIEWER",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=viewer",
    isActive: true,
    createdAt: "2026-03-10T09:15:00Z",
  },
]

// ==================== MOCK PROJECTS (untuk demo data isolation) ====================
/**
 * user-admin-001 memiliki 2 proyek, user-dev-002 memiliki 2 proyek.
 * ADMIN melihat semua (4), USER dev hanya miliknya (2), VIEWER tidak melihat apa pun.
 */
export const MOCK_PROJECTS: MockProject[] = [
  {
    id: "proj-001",
    name: "E-Commerce Platform",
    description: "Full-stack e-commerce dengan Next.js + Stripe",
    status: "active",
    userId: "user-admin-001",
    createdAtLabel: "1 Mar 2026",
    deployments: 24,
  },
  {
    id: "proj-002",
    name: "AI Chatbot",
    description: "Chatbot dengan OpenAI integration",
    status: "deploying",
    userId: "user-dev-002",
    createdAtLabel: "15 Mar 2026",
    deployments: 12,
  },
  {
    id: "proj-003",
    name: "Portfolio Website",
    description: "Personal portfolio dengan Astro",
    status: "active",
    userId: "user-dev-002",
    createdAtLabel: "1 Apr 2026",
    deployments: 8,
  },
  {
    id: "proj-004",
    name: "SaaS Dashboard",
    description: "Admin dashboard template",
    status: "inactive",
    userId: "user-admin-001",
    createdAtLabel: "10 Apr 2026",
    deployments: 5,
  },
]

// ==================== MOCK DEPLOYMENTS ====================

/** Proyek yang "di-share" ke VIEWER untuk dipantau (read-only) */
export const SHARED_PROJECT_IDS = ["proj-001", "proj-003"]

export const MOCK_DEPLOYMENTS: MockDeployment[] = [
  {
    id: "dep-101",
    projectId: "proj-001",
    branch: "feat/checkout-v2",
    commitMessage: "Add Stripe webhook handler",
    status: "success",
    triggeredBy: "Admin OmniStack",
    timeLabel: "12 menit lalu",
    durationLabel: "2m 14s",
    logLines: [
      "$ omnistack deploy --prod",
      "✓ Build Docker image (1m 38s)",
      "✓ Push ke registry internal",
      "✓ Rolling update 4/4 replica sehat",
      "✓ Live di https://shop.app.omnistack.dev",
    ],
  },
  {
    id: "dep-102",
    projectId: "proj-002",
    branch: "fix/prompt-timeout",
    commitMessage: "Upgrade OpenAI SDK & tambah retry",
    status: "building",
    triggeredBy: "Developer OmniStack",
    timeLabel: "3 menit lalu",
    logLines: [
      "$ omnistack deploy --preview",
      "✓ Deteksi stack: Node.js 22 (Nixpacks)",
      "→ Installing dependencies...",
      "→ Running build (tsc + next build)...",
    ],
  },
  {
    id: "dep-103",
    projectId: "proj-003",
    branch: "main",
    commitMessage: "Update dependencies Astro v5",
    status: "success",
    triggeredBy: "Developer OmniStack",
    timeLabel: "2 jam lalu",
    durationLabel: "48s",
    logLines: [
      "$ git push origin main → auto deploy",
      "✓ Static build selesai (48s)",
      "✓ Cache CDN di-purge",
      "✓ Live di https://portfolio.omnistack.dev",
    ],
  },
  {
    id: "dep-104",
    projectId: "proj-001",
    branch: "hotfix/cart-total",
    commitMessage: "Fix pembulatan total keranjang",
    status: "failed",
    triggeredBy: "Admin OmniStack",
    timeLabel: "5 jam lalu",
    durationLabel: "Gagal di 1m 02s",
    logLines: [
      "$ omnistack deploy --prod",
      "✓ Build Docker image",
      "✗ Health check gagal: /api/health timeout",
      "✗ Rollback otomatis ke revisi sebelumnya",
      "! Periksa log container: omnistack logs shop-api",
    ],
  },
  {
    id: "dep-105",
    projectId: "proj-004",
    branch: "chore/update-deps",
    commitMessage: "Bump dependencies minor",
    status: "queued",
    triggeredBy: "Admin OmniStack",
    timeLabel: "6 jam lalu",
    logLines: [
      "$ omnistack deploy --preview",
      "→ Menunggu worker slot bebas (posisi #1)...",
    ],
  },
]

// ==================== MOCK AUDIT LOGS (ADMIN only) ====================

export type AuditActionType =
  | "role_change"
  | "user_created"
  | "user_login"
  | "deploy"
  | "project_created"
  | "settings_changed"

export interface MockAuditLog {
  id: string
  actor: string
  actionType: AuditActionType
  detail: string
  target?: string
  timeLabel: string
}

export const MOCK_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: "audit-001",
    actor: "Admin OmniStack",
    actionType: "user_created",
    detail: "Membuat akun viewer@omnistack.dev dengan role VIEWER",
    target: "viewer@omnistack.dev",
    timeLabel: "10 menit lalu",
  },
  {
    id: "audit-002",
    actor: "Developer OmniStack",
    actionType: "user_login",
    detail: "Login berhasil via quick-login",
    timeLabel: "1 jam lalu",
  },
  {
    id: "audit-003",
    actor: "Developer OmniStack",
    actionType: "deploy",
    detail: "Trigger deployment fix/prompt-timeout pada AI Chatbot",
    target: "proj-002",
    timeLabel: "3 jam lalu",
  },
  {
    id: "audit-004",
    actor: "Admin OmniStack",
    actionType: "role_change",
    detail: "Menetapkan role USER untuk dev@omnistack.dev",
    target: "dev@omnistack.dev",
    timeLabel: "5 jam lalu",
  },
  {
    id: "audit-005",
    actor: "Admin OmniStack",
    actionType: "project_created",
    detail: "Membuat proyek SaaS Dashboard",
    target: "proj-004",
    timeLabel: "kemarin",
  },
  {
    id: "audit-006",
    actor: "Viewer OmniStack",
    actionType: "user_login",
    detail: "Login berhasil via quick-login",
    timeLabel: "kemarin",
  },
]

// ==================== KONFIGURASI ROLE ====================

/** Tujuan redirect setelah login sesuai README Role System */
export const ROLE_REDIRECTS: Record<Role, string> = {
  ADMIN: "/admin",
  USER: "/dashboard",
  VIEWER: "/dashboard",
}

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  USER: 2,
  VIEWER: 1,
}

/** Cek apakah `role` punya level >= `required` (ADMIN > USER > VIEWER) */
export function roleAtLeast(role: Role, required: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[required]
}

// ==================== HELPERS ====================

export function getMockUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.email === email)
}

/**
 * Data isolation per role:
 * - ADMIN  → semua proyek
 * - USER   → hanya proyek miliknya sendiri
 * - VIEWER → kosong (shared projects menyusul)
 */
export function getMockProjectsByUser(userId: string, role: Role): MockProject[] {
  if (role === "ADMIN") return MOCK_PROJECTS
  if (role === "USER") return MOCK_PROJECTS.filter((p) => p.userId === userId)
  return []
}

export function getTotalDeployments(projects: MockProject[]): number {
  return projects.reduce((sum, p) => sum + p.deployments, 0)
}

/**
 * Deployment per role:
 * - ADMIN  → semua deployment
 * - USER   → hanya deployment proyek miliknya
 * - VIEWER → deployment dari proyek yang di-share (read-only)
 */
export function getMockDeploymentsForRole(
  userId: string,
  role: Role
): MockDeployment[] {
  const ownProjectIds = MOCK_PROJECTS.filter((p) => p.userId === userId).map(
    (p) => p.id
  )

  return MOCK_DEPLOYMENTS.filter((d) => {
    if (role === "ADMIN") return true
    if (role === "USER") return ownProjectIds.includes(d.projectId)
    return SHARED_PROJECT_IDS.includes(d.projectId)
  })
}
