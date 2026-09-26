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
  /** Status detail untuk User Management. Jika tidak diisi, diturunkan dari isActive. */
  status?: UserStatus
  /** Timestamp undangan terakhir dikirim (untuk user berstatus "invited") */
  invitedAt?: string
}

export type UserStatus = "active" | "suspended" | "invited"

/** Status efektif user — fallback dari isActive jika `status` tidak diisi */
export function getUserStatus(user: Pick<MockUser, "isActive" | "status">): UserStatus {
  if (user.status) return user.status
  return user.isActive ? "active" : "suspended"
}

/** User tanpa kredensial — aman disimpan di localStorage & dipakai lintas komponen */
export type SessionUser = Omit<MockUser, "password">

export type ProjectStatus = "active" | "inactive" | "deploying" | "failed"

export interface MockProjectStack {
  frontend?: string[]
  backend?: string[]
  database?: string[]
}

export interface MockProject {
  id: string
  name: string
  description: string
  status: ProjectStatus
  userId: string
  createdAtLabel: string
  deployments: number
  stack?: MockProjectStack
  url?: string
  lastDeployLabel?: string
  progress?: number
  errorMessage?: string
}

export type DeploymentStatus = "success" | "building" | "failed" | "queued"

export interface PipelineStep {
  name: string
  status: "pending" | "running" | "success" | "failed" | "skipped"
  durationSeconds?: number
  logs: string[]
}

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
  commitSha: string
  environment: "production" | "staging" | "preview"
  authorEmail: string
  trigger: "manual" | "git_push" | "api"
  startedAt: string
  finishedAt?: string
  durationSeconds?: number
  pipeline: PipelineStep[]
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
  {
    id: "user-invite-004",
    email: "dave@startup.io",
    password: "",
    name: "Dave Anggara",
    role: "USER",
    isActive: false,
    status: "invited",
    invitedAt: "2026-08-20T08:00:00Z",
    createdAt: "2026-08-20T08:00:00Z",
  },
  {
    id: "user-invite-005",
    email: "rina@client.co",
    password: "",
    name: "Rina Kusuma",
    role: "VIEWER",
    isActive: false,
    status: "invited",
    invitedAt: "2026-08-21T13:45:00Z",
    createdAt: "2026-08-21T13:45:00Z",
  },
  {
    id: "user-invite-006",
    email: "budi@agency.dev",
    password: "",
    name: "Budi Santoso",
    role: "USER",
    isActive: false,
    status: "invited",
    invitedAt: "2026-08-22T16:10:00Z",
    createdAt: "2026-08-22T16:10:00Z",
  },
]

// ==================== MOCK PROJECTS (untuk demo data isolation) ====================
/**
 * user-admin-001 memiliki 3 proyek, user-dev-002 memiliki 3 proyek.
 * Status mencakup semua variasi card state: active (Live),
 * deploying (Building + progress), failed (+ errorMessage), inactive (Stopped).
 * ADMIN melihat semua (6), USER dev hanya miliknya (3), VIEWER tidak melihat apa pun.
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
    stack: {
      frontend: ["Next.js", "React"],
      backend: ["Node.js"],
      database: ["PostgreSQL", "Redis"],
    },
    url: "shop.app.omnistack.dev",
    lastDeployLabel: "2 jam lalu",
  },
  {
    id: "proj-002",
    name: "AI Chatbot",
    description: "Chatbot dengan OpenAI integration",
    status: "deploying",
    userId: "user-dev-002",
    createdAtLabel: "15 Mar 2026",
    deployments: 12,
    stack: {
      frontend: ["React", "Vite"],
      backend: ["NestJS"],
      database: ["MongoDB"],
    },
    lastDeployLabel: "3 menit lalu",
    progress: 45,
  },
  {
    id: "proj-003",
    name: "Portfolio Website",
    description: "Personal portfolio dengan Astro",
    status: "active",
    userId: "user-dev-002",
    createdAtLabel: "1 Apr 2026",
    deployments: 8,
    stack: {
      frontend: ["Astro", "Tailwind"],
      database: ["SQLite"],
    },
    url: "portfolio.omnistack.dev",
    lastDeployLabel: "1 hari lalu",
  },
  {
    id: "proj-004",
    name: "SaaS Dashboard",
    description: "Admin dashboard template",
    status: "failed",
    userId: "user-admin-001",
    createdAtLabel: "10 Apr 2026",
    deployments: 5,
    stack: {
      frontend: ["Next.js", "TypeScript"],
      database: ["PostgreSQL"],
    },
    lastDeployLabel: "5 jam lalu",
    errorMessage: "Build timeout setelah 300s — periksa log container",
  },
  {
    id: "proj-005",
    name: "Marketing Landing",
    description: "Landing page kampanye dengan animasi Framer Motion",
    status: "inactive",
    userId: "user-admin-001",
    createdAtLabel: "2 Mei 2026",
    deployments: 3,
    stack: {
      frontend: ["Astro"],
    },
    url: "promo.omnistack.dev",
    lastDeployLabel: "1 minggu lalu",
  },
  {
    id: "proj-006",
    name: "Analytics API",
    description: "REST API agregasi metrik real-time",
    status: "active",
    userId: "user-dev-002",
    createdAtLabel: "20 Mei 2026",
    deployments: 17,
    stack: {
      backend: ["Go", "Chi"],
      database: ["PostgreSQL", "Redis"],
    },
    url: "api-analytics.omnistack.dev",
    lastDeployLabel: "30 menit lalu",
  },
]

// ==================== MOCK DEPLOYMENTS ====================

/** Proyek yang "di-share" ke VIEWER untuk dipantau (read-only) */
export const SHARED_PROJECT_IDS = ["proj-001", "proj-003"]

export const MOCK_DEPLOYMENTS: MockDeployment[] = [
  // 1. dep-101 — proj-001, success, production, 5 steps all success
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
    commitSha: "a3f7c21",
    environment: "production",
    authorEmail: "admin@omnistack.dev",
    trigger: "manual",
    startedAt: "2026-08-23T14:32:00Z",
    finishedAt: "2026-08-23T14:34:14Z",
    durationSeconds: 134,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 12, logs: ["Cloning into '/build/workspace'...", "HEAD is now at a3f7c21"] },
      { name: "Install dependencies", status: "success", durationSeconds: 38, logs: ["npm ci --prefer-offline", "added 847 packages in 38s"] },
      { name: "Run tests", status: "success", durationSeconds: 45, logs: ["vitest run --coverage", "Tests: 142 passed, 0 failed"] },
      { name: "Build image", status: "success", durationSeconds: 38, logs: ["docker build -t shop-api:a3f7c21 .", "Successfully built a3f7c21"] },
      { name: "Deploy", status: "success", durationSeconds: 12, logs: ["Rolling update 4/4 replicas", "Health check OK"] },
    ],
  },
  // 2. dep-102 — proj-002, building, preview, 3 steps (2 success, 1 running)
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
    commitSha: "b9e4d08",
    environment: "preview",
    authorEmail: "dev@omnistack.dev",
    trigger: "git_push",
    startedAt: "2026-08-23T14:43:00Z",
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 9, logs: ["Cloning into '/build/workspace'...", "HEAD is now at b9e4d08"] },
      { name: "Install dependencies", status: "success", durationSeconds: 28, logs: ["npm ci --prefer-offline", "added 612 packages in 28s"] },
      { name: "Run tests", status: "running", logs: ["vitest run --coverage", "Running 87 tests..."] },
    ],
  },
  // 3. dep-103 — proj-003, success, production, 5 steps all success
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
    commitSha: "c1d2e3f",
    environment: "production",
    authorEmail: "dev@omnistack.dev",
    trigger: "git_push",
    startedAt: "2026-08-23T12:46:00Z",
    finishedAt: "2026-08-23T12:46:48Z",
    durationSeconds: 48,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 8, logs: ["Cloning into '/build/workspace'...", "HEAD is now at c1d2e3f"] },
      { name: "Install dependencies", status: "success", durationSeconds: 14, logs: ["npm ci --prefer-offline", "added 312 packages in 14s"] },
      { name: "Run tests", status: "success", durationSeconds: 6, logs: ["vitest run", "Tests: 34 passed, 0 failed"] },
      { name: "Build image", status: "success", durationSeconds: 12, logs: ["astro build", "✓ 18 pages built in 12s"] },
      { name: "Deploy", status: "success", durationSeconds: 8, logs: ["CDN cache purged", "Live at portfolio.omnistack.dev"] },
    ],
  },
  // 4. dep-104 — proj-001, failed, production, 5 steps (3 success, 1 failed)
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
    commitSha: "d4e5f6a",
    environment: "production",
    authorEmail: "admin@omnistack.dev",
    trigger: "manual",
    startedAt: "2026-08-23T09:54:00Z",
    finishedAt: "2026-08-23T09:55:02Z",
    durationSeconds: 62,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 10, logs: ["Cloning into '/build/workspace'...", "HEAD is now at d4e5f6a"] },
      { name: "Install dependencies", status: "success", durationSeconds: 36, logs: ["npm ci --prefer-offline", "added 847 packages in 36s"] },
      { name: "Run tests", status: "success", durationSeconds: 42, logs: ["vitest run --coverage", "Tests: 142 passed, 0 failed"] },
      { name: "Build image", status: "failed", durationSeconds: 44, logs: ["docker build -t shop-api:d4e5f6a .", "✗ Health check failed: /api/health timeout after 30s"] },
      { name: "Deploy", status: "skipped", logs: ["Skipped: previous step failed"] },
    ],
  },
  // 5. dep-105 — proj-004, queued, staging, 1 step pending
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
    commitSha: "e7f8a9b",
    environment: "staging",
    authorEmail: "admin@omnistack.dev",
    trigger: "manual",
    startedAt: "2026-08-23T08:48:00Z",
    pipeline: [
      { name: "Clone repository", status: "pending", logs: ["Waiting for worker slot..."] },
    ],
  },
  // 6. dep-106 — proj-002, success, production, 5 steps all success
  {
    id: "dep-106",
    projectId: "proj-002",
    branch: "feat/vector-search",
    commitMessage: "Implement cosine similarity search",
    status: "success",
    triggeredBy: "Developer OmniStack",
    timeLabel: "8 jam lalu",
    durationLabel: "1m 52s",
    logLines: [
      "$ omnistack deploy --prod",
      "✓ Build Docker image (1m 18s)",
      "✓ Push ke registry internal",
      "✓ Rolling update 3/3 replica sehat",
      "✓ Live di https://chatbot.app.omnistack.dev",
    ],
    commitSha: "f2a3b4c",
    environment: "production",
    authorEmail: "dev@omnistack.dev",
    trigger: "git_push",
    startedAt: "2026-08-23T06:46:00Z",
    finishedAt: "2026-08-23T06:47:52Z",
    durationSeconds: 112,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 11, logs: ["Cloning into '/build/workspace'...", "HEAD is now at f2a3b4c"] },
      { name: "Install dependencies", status: "success", durationSeconds: 42, logs: ["npm ci --prefer-offline", "added 923 packages in 42s"] },
      { name: "Run tests", status: "success", durationSeconds: 38, logs: ["vitest run --coverage", "Tests: 96 passed, 0 failed"] },
      { name: "Build image", status: "success", durationSeconds: 18, logs: ["docker build -t chatbot-api:f2a3b4c .", "Successfully built f2a3b4c"] },
      { name: "Deploy", status: "success", durationSeconds: 12, logs: ["Rolling update 3/3 replicas", "Health check OK"] },
    ],
  },
  // 7. dep-107 — proj-001, success, production, 5 steps all success (rolled back)
  {
    id: "dep-107",
    projectId: "proj-001",
    branch: "release/v2.0",
    commitMessage: "Release v2.0.0 — new checkout flow",
    status: "success",
    triggeredBy: "Admin OmniStack",
    timeLabel: "1 hari lalu",
    durationLabel: "3m 08s",
    logLines: [
      "$ omnistack deploy --prod",
      "✓ Build Docker image (2m 22s)",
      "✓ Push ke registry internal",
      "✓ Rolling update 4/4 replica sehat",
      "✓ Live di https://shop.app.omnistack.dev",
      "✗ Rollback to previous revision",
    ],
    commitSha: "1a2b3c4",
    environment: "production",
    authorEmail: "admin@omnistack.dev",
    trigger: "manual",
    startedAt: "2026-08-22T10:30:00Z",
    finishedAt: "2026-08-22T10:33:08Z",
    durationSeconds: 188,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 14, logs: ["Cloning into '/build/workspace'...", "HEAD is now at 1a2b3c4"] },
      { name: "Install dependencies", status: "success", durationSeconds: 56, logs: ["npm ci --prefer-offline", "added 1045 packages in 56s"] },
      { name: "Run tests", status: "success", durationSeconds: 62, logs: ["vitest run --coverage", "Tests: 158 passed, 0 failed"] },
      { name: "Build image", status: "success", durationSeconds: 42, logs: ["docker build -t shop-api:1a2b3c4 .", "Successfully built 1a2b3c4"] },
      { name: "Deploy", status: "success", durationSeconds: 14, logs: ["Rolling update 4/4 replicas", "Health check OK", "✗ Rollback to previous revision"] },
    ],
  },
  // 8. dep-108 — proj-003, building, preview, 2 steps (1 success, 1 running)
  {
    id: "dep-108",
    projectId: "proj-003",
    branch: "feat/i18n",
    commitMessage: "Add Indonesian & English translations",
    status: "building",
    triggeredBy: "Developer OmniStack",
    timeLabel: "15 menit lalu",
    logLines: [
      "$ omnistack deploy --preview",
      "✓ Deteksi stack: Astro (Nixpacks)",
      "→ Installing dependencies...",
    ],
    commitSha: "5d6e7f8",
    environment: "preview",
    authorEmail: "dev@omnistack.dev",
    trigger: "git_push",
    startedAt: "2026-08-23T14:31:00Z",
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 8, logs: ["Cloning into '/build/workspace'...", "HEAD is now at 5d6e7f8"] },
      { name: "Install dependencies", status: "running", logs: ["npm ci --prefer-offline", "Installing 324 packages..."] },
    ],
  },
  // 9. dep-109 — proj-004, failed, production, 5 steps (2 success, 1 failed)
  {
    id: "dep-109",
    projectId: "proj-004",
    branch: "main",
    commitMessage: "Merge feature dashboard widgets",
    status: "failed",
    triggeredBy: "Admin OmniStack",
    timeLabel: "12 jam lalu",
    durationLabel: "Gagal di 2m 18s",
    logLines: [
      "$ omnistack deploy --prod",
      "✓ Build Docker image",
      "✓ Health check passed",
      "✗ Database migration failed: column 'theme' already exists",
      "✗ Rollback otomatis ke revisi sebelumnya",
    ],
    commitSha: "9a0b1c2",
    environment: "production",
    authorEmail: "admin@omnistack.dev",
    trigger: "manual",
    startedAt: "2026-08-23T02:38:00Z",
    finishedAt: "2026-08-23T02:40:18Z",
    durationSeconds: 138,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 10, logs: ["Cloning into '/build/workspace'...", "HEAD is now at 9a0b1c2"] },
      { name: "Install dependencies", status: "success", durationSeconds: 48, logs: ["npm ci --prefer-offline", "added 978 packages in 48s"] },
      { name: "Run tests", status: "success", durationSeconds: 54, logs: ["vitest run --coverage", "Tests: 112 passed, 0 failed"] },
      { name: "Build image", status: "success", durationSeconds: 36, logs: ["docker build -t saas-dashboard:9a0b1c2 .", "Successfully built 9a0b1c2"] },
      { name: "Deploy", status: "failed", durationSeconds: 42, logs: ["Running migrations...", "✗ Migration failed: column 'theme' already exists in 'projects'"] },
    ],
  },
  // 10. dep-110 — proj-006, success, staging, 5 steps all success
  {
    id: "dep-110",
    projectId: "proj-006",
    branch: "feat/metrics",
    commitMessage: "Add Prometheus metrics endpoint",
    status: "success",
    triggeredBy: "Developer OmniStack",
    timeLabel: "18 jam lalu",
    durationLabel: "1m 24s",
    logLines: [
      "$ omnistack deploy --staging",
      "✓ Build Docker image (58s)",
      "✓ Push ke registry internal",
      "✓ Rolling update 2/2 replica sehat",
      "✓ Live at https://api-analytics-staging.omnistack.dev",
    ],
    commitSha: "3e4f5a6",
    environment: "staging",
    authorEmail: "dev@omnistack.dev",
    trigger: "api",
    startedAt: "2026-08-22T20:42:00Z",
    finishedAt: "2026-08-22T20:43:24Z",
    durationSeconds: 84,
    pipeline: [
      { name: "Clone repository", status: "success", durationSeconds: 9, logs: ["Cloning into '/build/workspace'...", "HEAD is now at 3e4f5a6"] },
      { name: "Install dependencies", status: "success", durationSeconds: 22, logs: ["go mod download", "All dependencies cached"] },
      { name: "Run tests", status: "success", durationSeconds: 18, logs: ["go test ./...", "ok  github.com/omnistack/analytics  1.2s"] },
      { name: "Build image", status: "success", durationSeconds: 28, logs: ["docker build -t analytics-api:3e4f5a6 .", "Successfully built 3e4f5a6"] },
      { name: "Deploy", status: "success", durationSeconds: 12, logs: ["Rolling update 2/2 replicas", "Health check OK"] },
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

/** Gabungkan seluruh tech stack proyek menjadi array flat untuk badge */
export function getProjectStackList(project: MockProject): string[] {
  const { frontend = [], backend = [], database = [] } = project.stack ?? {}
  return [...frontend, ...backend, ...database]
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

// ==================== DATABASES (DBaaS) ====================

export type DatabaseEngine = "POSTGRES" | "MYSQL" | "REDIS" | "MONGODB"

export type DatabaseStatus =
  | "HEALTHY"
  | "BACKUPING"
  | "ERROR"
  | "MAINTENANCE"

export type DatabasePlan = "STARTER" | "PRO" | "BUSINESS" | "ENTERPRISE"

export interface DbConnection {
  host: string
  port: number
  database: string
  username: string
  password: string
  uri: string
  sslMode: "require" | "verify-full"
}

export interface DbResources {
  storageUsedGb: number
  storageLimitGb: number
  cpuUsage: number
  ramUsage: number
  connectionsCurrent: number
  connectionsMax: number
}

export interface DbMetrics {
  queriesPerSecond: number
  avgResponseTimeMs: number
  cacheHitRatio?: number
  uptime: number
}

export interface MockDatabase {
  id: string
  name: string
  engine: DatabaseEngine
  version: string
  status: DatabaseStatus
  projectId: string
  ownerId: string
  region: string
  plan: DatabasePlan
  createdAtLabel: string
  connection: DbConnection
  resources: DbResources
  metrics: DbMetrics
  pitrEnabled: boolean
}

export type BackupType = "SCHEDULED" | "MANUAL" | "PITR"

export interface MockBackup {
  id: string
  databaseId: string
  type: BackupType
  sizeLabel: string
  createdAtLabel: string
  retentionDays: number
}

export const ENGINE_META: Record<
  DatabaseEngine,
  { label: string; defaultVersion: string; color: string; versions: string[] }
> = {
  POSTGRES: {
    label: "PostgreSQL",
    defaultVersion: "15.4",
    color: "#336791",
    versions: ["15.4", "16.2"],
  },
  MYSQL: {
    label: "MySQL",
    defaultVersion: "8.0",
    color: "#4479A1",
    versions: ["8.0", "8.4"],
  },
  REDIS: {
    label: "Redis",
    defaultVersion: "7.2",
    color: "#DC382D",
    versions: ["7.2", "7.0"],
  },
  MONGODB: {
    label: "MongoDB",
    defaultVersion: "7.0",
    color: "#47A248",
    versions: ["7.0", "6.0"],
  },
}

export const DB_PLANS: Array<{
  value: DatabasePlan
  label: string
  priceLabel: string
  storageGb: number
}> = [
  { value: "STARTER", label: "Starter", priceLabel: "$9/mo", storageGb: 5 },
  { value: "PRO", label: "Pro", priceLabel: "$29/mo", storageGb: 50 },
  { value: "BUSINESS", label: "Business", priceLabel: "$99/mo", storageGb: 500 },
  { value: "ENTERPRISE", label: "Enterprise", priceLabel: "Custom", storageGb: 1000 },
]

/**
 * Mock databases:
 * - proj-001 (E-Commerce, admin): prod PG healthy, cache Redis healthy, analytics PG BACKUPING
 * - proj-002 (AI Chatbot, dev): vector Mongo ERROR, sessions Redis healthy
 * - proj-003 (shared): client MySQL MAINTENANCE
 */
export const MOCK_DATABASES: MockDatabase[] = [
  {
    id: "db-prod-pg",
    name: "omnistack_prod",
    engine: "POSTGRES",
    version: "15.4",
    status: "HEALTHY",
    projectId: "proj-001",
    ownerId: "user-admin-001",
    region: "ap-southeast-1",
    plan: "STARTER",
    createdAtLabel: "3 bulan lalu",
    connection: {
      host: "db.omnistack.dev",
      port: 5432,
      database: "omnistack_prod",
      username: "omnistack_user",
      password: "sk-live-9f2b7c41ae",
      uri: "postgresql://omnistack_user:••••••••@db.omnistack.dev:5432/omnistack_prod?sslmode=require",
      sslMode: "require",
    },
    resources: {
      storageUsedGb: 1.2,
      storageLimitGb: 5,
      cpuUsage: 12,
      ramUsage: 28,
      connectionsCurrent: 24,
      connectionsMax: 100,
    },
    metrics: { queriesPerSecond: 320, avgResponseTimeMs: 12, uptime: 99.98 },
    pitrEnabled: true,
  },
  {
    id: "db-cache-redis",
    name: "omnistack_cache",
    engine: "REDIS",
    version: "7.2",
    status: "HEALTHY",
    projectId: "proj-001",
    ownerId: "user-admin-001",
    region: "ap-southeast-1",
    plan: "STARTER",
    createdAtLabel: "3 bulan lalu",
    connection: {
      host: "cache.omnistack.dev",
      port: 6379,
      database: "default",
      username: "default",
      password: "redis-tk81mz04",
      uri: "rediss://default:••••••••@cache.omnistack.dev:6379",
      sslMode: "require",
    },
    resources: {
      storageUsedGb: 0.25,
      storageLimitGb: 5,
      cpuUsage: 6,
      ramUsage: 14,
      connectionsCurrent: 8,
      connectionsMax: 100,
    },
    metrics: { queriesPerSecond: 1450, avgResponseTimeMs: 2, cacheHitRatio: 94.2, uptime: 99.99 },
    pitrEnabled: false,
  },
  {
    id: "db-analytics-pg",
    name: "omnistack_analytics",
    engine: "POSTGRES",
    version: "16.2",
    status: "BACKUPING",
    projectId: "proj-001",
    ownerId: "user-admin-001",
    region: "ap-southeast-1",
    plan: "PRO",
    createdAtLabel: "1 bulan lalu",
    connection: {
      host: "analytics.omnistack.dev",
      port: 5432,
      database: "omnistack_analytics",
      username: "analytics_user",
      password: "pg-an-338bd1c9f2",
      uri: "postgresql://analytics_user:••••••••@analytics.omnistack.dev:5432/omnistack_analytics?sslmode=require",
      sslMode: "verify-full",
    },
    resources: {
      storageUsedGb: 22,
      storageLimitGb: 50,
      cpuUsage: 34,
      ramUsage: 52,
      connectionsCurrent: 41,
      connectionsMax: 200,
    },
    metrics: { queriesPerSecond: 180, avgResponseTimeMs: 45, uptime: 99.91 },
    pitrEnabled: true,
  },
  {
    id: "db-vector-mongo",
    name: "chatbot_vectorstore",
    engine: "MONGODB",
    version: "7.0",
    status: "ERROR",
    projectId: "proj-002",
    ownerId: "user-dev-002",
    region: "ap-southeast-1",
    plan: "STARTER",
    createdAtLabel: "2 minggu lalu",
    connection: {
      host: "vector.omnistack.dev",
      port: 27017,
      database: "chatbot_vectors",
      username: "vector_user",
      password: "mg-vs-77aa10fe",
      uri: "mongodb+srv://vector_user:••••••••@vector.omnistack.dev/chatbot_vectors",
      sslMode: "require",
    },
    resources: {
      storageUsedGb: 4.6,
      storageLimitGb: 5,
      cpuUsage: 91,
      ramUsage: 88,
      connectionsCurrent: 97,
      connectionsMax: 100,
    },
    metrics: { queriesPerSecond: 95, avgResponseTimeMs: 210, uptime: 97.42 },
    pitrEnabled: false,
  },
  {
    id: "db-sessions-redis",
    name: "chatbot_sessions",
    engine: "REDIS",
    version: "7.2",
    status: "HEALTHY",
    projectId: "proj-002",
    ownerId: "user-dev-002",
    region: "ap-southeast-1",
    plan: "STARTER",
    createdAtLabel: "2 minggu lalu",
    connection: {
      host: "sessions.omnistack.dev",
      port: 6379,
      database: "default",
      username: "default",
      password: "redis-ss55qz71",
      uri: "rediss://default:••••••••@sessions.omnistack.dev:6379",
      sslMode: "require",
    },
    resources: {
      storageUsedGb: 0.4,
      storageLimitGb: 5,
      cpuUsage: 9,
      ramUsage: 21,
      connectionsCurrent: 12,
      connectionsMax: 100,
    },
    metrics: { queriesPerSecond: 720, avgResponseTimeMs: 1, cacheHitRatio: 89.5, uptime: 99.95 },
    pitrEnabled: false,
  },
  {
    id: "db-client-mysql",
    name: "client_portal_db",
    engine: "MYSQL",
    version: "8.0",
    status: "MAINTENANCE",
    projectId: "proj-003",
    ownerId: "user-admin-001",
    region: "ap-southeast-1",
    plan: "BUSINESS",
    createdAtLabel: "5 bulan lalu",
    connection: {
      host: "portal.omnistack.dev",
      port: 3306,
      database: "client_portal",
      username: "portal_user",
      password: "my-cp-a19e4cc7",
      uri: "mysql://portal_user:••••••••@portal.omnistack.dev:3306/client_portal?ssl-mode=REQUIRED",
      sslMode: "verify-full",
    },
    resources: {
      storageUsedGb: 120,
      storageLimitGb: 500,
      cpuUsage: 18,
      ramUsage: 40,
      connectionsCurrent: 56,
      connectionsMax: 300,
    },
    metrics: { queriesPerSecond: 410, avgResponseTimeMs: 18, uptime: 99.87 },
    pitrEnabled: true,
  },
]

const BACKUP_DATES = [
  "2026-10-15 02:00",
  "2026-10-14 02:00",
  "2026-10-13 14:32",
  "2026-10-13 02:00",
  "2026-10-12 02:00",
] as const

/** 5 backup terjadwal/manual untuk setiap DB yang PITR-enabled (deterministik) */
export const MOCK_BACKUPS: MockBackup[] = MOCK_DATABASES.filter(
  (d) => d.pitrEnabled
).flatMap((db) =>
  BACKUP_DATES.map((date, i) => ({
    id: `${db.id}-bk-${String(i + 1).padStart(2, "0")}`,
    databaseId: db.id,
    type: i === 2 ? ("MANUAL" as BackupType) : ("SCHEDULED" as BackupType),
    sizeLabel: i >= 3 ? "1.1 GB" : "1.2 GB",
    createdAtLabel: date,
    retentionDays: 30,
  }))
)

/**
 * Database per role:
 * - ADMIN  → semua database
 * - USER   → hanya database miliknya
 * - VIEWER → database dari proyek shared (read-only)
 */
export function getMockDatabasesForRole(userId: string, role: Role): MockDatabase[] {
  if (role === "ADMIN") return MOCK_DATABASES
  if (role === "USER") return MOCK_DATABASES.filter((d) => d.ownerId === userId)
  return MOCK_DATABASES.filter((d) => SHARED_PROJECT_IDS.includes(d.projectId))
}

export function getDatabasesByProject(projectId: string): MockDatabase[] {
  return MOCK_DATABASES.filter((d) => d.projectId === projectId)
}



export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG"

export type LogCategory = "runtime" | "build" | "access" | "database"

export interface MockLogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  category: LogCategory
}

const LOG_TIME_BASE = Date.UTC(2026, 7, 24, 9, 0, 0)
const minutesAgo = (m: number) => new Date(LOG_TIME_BASE - m * 60_000).toISOString()

export const MOCK_LOGS: MockLogEntry[] = [
  { id: "log-01", timestamp: minutesAgo(60), level: "INFO", source: "app-server", message: "Application started successfully on port 3000", category: "runtime" },
  { id: "log-02", timestamp: minutesAgo(58), level: "INFO", source: "database", message: "Connected to PostgreSQL database (pool: 5/20)", category: "database" },
  { id: "log-03", timestamp: minutesAgo(56), level: "INFO", source: "cache", message: "Redis cache initialized - hit ratio: 94.2%", category: "runtime" },
  { id: "log-04", timestamp: minutesAgo(54), level: "WARN", source: "app-server", message: "High memory usage detected: 892MB / 1024MB (87%)", category: "runtime" },
  { id: "log-05", timestamp: minutesAgo(53), level: "ERROR", source: "database", message: "Connection pool exhausted - timeout after 5000ms", category: "database" },
  { id: "log-06", timestamp: minutesAgo(51), level: "INFO", source: "app-server", message: "GET /api/users 200 OK - 45ms", category: "access" },
  { id: "log-07", timestamp: minutesAgo(50), level: "DEBUG", source: "auth", message: "Token validation successful for user: dev@omnistack.dev", category: "access" },
  { id: "log-08", timestamp: minutesAgo(48), level: "WARN", source: "rate-limiter", message: "Rate limit warning: 450/500 requests from IP 192.168.1.100", category: "access" },
  { id: "log-09", timestamp: minutesAgo(46), level: "INFO", source: "scheduler", message: "Scheduled task completed: cleanup_temp_files (2.3s)", category: "runtime" },
  { id: "log-10", timestamp: minutesAgo(45), level: "ERROR", source: "app-server", message: "Unhandled exception: TypeError: Cannot read property 'map' of undefined", category: "runtime" },
  { id: "log-11", timestamp: minutesAgo(40), level: "INFO", source: "builder", message: "Cloning repository git@github.com:acme/store.git (branch main)", category: "build" },
  { id: "log-12", timestamp: minutesAgo(38), level: "INFO", source: "builder", message: "Installing dependencies: npm ci (412 packages)", category: "build" },
  { id: "log-13", timestamp: minutesAgo(35), level: "INFO", source: "builder", message: "Compiled successfully - 38 routes generated in 42s", category: "build" },
  { id: "log-14", timestamp: minutesAgo(34), level: "WARN", source: "builder", message: "Build warning: chunk size exceeds 500kB (bundle/main-8f3a.js)", category: "build" },
  { id: "log-15", timestamp: minutesAgo(30), level: "INFO", source: "deployer", message: "Deployment promoted to production (region sg-1)", category: "build" },
  { id: "log-16", timestamp: minutesAgo(20), level: "DEBUG", source: "database", message: "Query executed: SELECT * FROM users WHERE email = ? (12ms)", category: "database" },
  { id: "log-17", timestamp: minutesAgo(15), level: "WARN", source: "database", message: "Slow query detected: avg latency increased 45ms -> 230ms in 24h", category: "database" },
  { id: "log-18", timestamp: minutesAgo(10), level: "INFO", source: "cache", message: "Cache warmed: 128 keys preloaded for tenant acme", category: "runtime" },
]
