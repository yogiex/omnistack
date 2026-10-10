import type {
  MockProjectStack,
  ProjectSource,
  ProjectSourceProvider,
} from "@/lib/mock-data"

/* -------------------------------------------------------------------------- */
/*  Konstanta                                                                 */
/* -------------------------------------------------------------------------- */

/** Host Git brand yang dikenali. Host lain tetap boleh (provider "generic"). */
export const ALLOWED_GIT_HOSTS = ["github.com", "gitlab.com"] as const

/**
 * Batas ukuran arsip upload (mock, client-side). Backend nanti yang
 * menegakkan batas sebenarnya — ini hanya untuk UX validasi awal.
 */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

/* -------------------------------------------------------------------------- */
/*  Deteksi & validasi Git                                                    */
/* -------------------------------------------------------------------------- */

/** Provider dari host URL. Host tak dikenal → "generic". */
export function detectGitProvider(url: string): ProjectSourceProvider {
  const host = parseHost(url)
  if (host === "github.com" || host.endsWith(".github.com")) return "github"
  if (host === "gitlab.com" || host.endsWith(".gitlab.com")) return "gitlab"
  return "generic"
}

/**
 * Validasi URL repo sebelum masuk state.
 *
 * Aturan (mengacu `next-update-fitur-git-integration.md` §7):
 * - wajib `https` (tolak `http`, `ssh`, `file`, `git`);
 * - tolak host internal/loopback (anti-SSRF dasar);
 * - bentuk `owner/repo` (minimal 2 segmen path).
 *
 * Return `null` jika valid, atau pesan error untuk ditampilkan di UI.
 * HARUS diulang di server saat backend siap — validasi client bukan gerbang.
 */
export function validateGitUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return "URL repositori wajib diisi."

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return "Format URL tidak valid."
  }

  if (parsed.protocol !== "https:") {
    return "Hanya URL https yang diizinkan."
  }

  const host = parsed.hostname.toLowerCase()
  if (isPrivateHost(host)) {
    return "Host internal/loopback tidak diizinkan."
  }

  const segments = parsed.pathname.replace(/\.git$/, "").split("/").filter(Boolean)
  if (segments.length < 2) {
    return "URL harus berisi owner/repo."
  }

  return null
}

/** Branch/ref aman untuk argumen shell: `^[A-Za-z0-9._/-]+$` dan tanpa `..`. */
export function isValidBranchRef(ref: string): boolean {
  const trimmed = ref.trim()
  if (!trimmed) return false
  if (trimmed.includes("..")) return false
  return /^[A-Za-z0-9._/-]+$/.test(trimmed)
}

/* -------------------------------------------------------------------------- */
/*  Util tampilan                                                             */
/* -------------------------------------------------------------------------- */

/** 4_820_000 → "4.6 MB". Deterministik (tanpa locale-dependent formatting). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

/** Label ringkas sumber untuk badge/kartu. */
export function getSourceLabel(source: ProjectSource | undefined): string {
  if (!source) return "Manual"
  if (source.kind === "upload") return source.fileName ?? "Upload"
  if (source.kind === "git") {
    const provider =
      source.provider === "github"
        ? "GitHub"
        : source.provider === "gitlab"
          ? "GitLab"
          : "Git"
    return `${provider} · ${source.branch ?? "main"}`
  }
  return "Manual"
}

/** Nama repo dari URL (`owner/repo`) untuk autofill nama proyek. */
export function repoNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url.trim())
    const segments = parsed.pathname
      .replace(/\.git$/, "")
      .split("/")
      .filter(Boolean)
    return segments[segments.length - 1] ?? ""
  } catch {
    return ""
  }
}

/** Nama proyek → slug domain: "My App!" → "my-app". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/* -------------------------------------------------------------------------- */
/*  Analisis sumber (mock, siap ganti ke backend)                             */
/* -------------------------------------------------------------------------- */

const STACK_KEYWORDS: Array<{
  pattern: RegExp
  stack: Partial<MockProjectStack>
}> = [
  { pattern: /next/i, stack: { frontend: ["Next.js"] } },
  { pattern: /nuxt/i, stack: { frontend: ["Nuxt"] } },
  { pattern: /astro/i, stack: { frontend: ["Astro"] } },
  { pattern: /vue/i, stack: { frontend: ["Vue"] } },
  { pattern: /svelte/i, stack: { frontend: ["Svelte"] } },
  { pattern: /react|vite/i, stack: { frontend: ["React", "Vite"] } },
  { pattern: /nest/i, stack: { backend: ["NestJS"] } },
  { pattern: /express/i, stack: { backend: ["Express"] } },
  { pattern: /go[-_]?mod|golang|chi/i, stack: { backend: ["Go"] } },
  { pattern: /docker/i, stack: { backend: ["Docker"] } },
  { pattern: /postgres|pg/i, stack: { database: ["PostgreSQL"] } },
  { pattern: /mysql/i, stack: { database: ["MySQL"] } },
  { pattern: /mongo/i, stack: { database: ["MongoDB"] } },
  { pattern: /redis/i, stack: { database: ["Redis"] } },
  { pattern: /sqlite/i, stack: { database: ["SQLite"] } },
]

/** Deteksi stack dari nama file/repo. Return `undefined` jika tak ada petunjuk. */
function detectStackFromName(name: string): MockProjectStack | undefined {
  const found: MockProjectStack = {}
  for (const { pattern, stack } of STACK_KEYWORDS) {
    if (!pattern.test(name)) continue
    if (stack.frontend) found.frontend = [...(found.frontend ?? []), ...stack.frontend]
    if (stack.backend) found.backend = [...(found.backend ?? []), ...stack.backend]
    if (stack.database) found.database = [...(found.database ?? []), ...stack.database]
  }
  const hasAny = found.frontend || found.backend || found.database
  return hasAny ? found : undefined
}

/**
 * Analisis sumber → isi `detectedStack` + `analyzedAtLabel`.
 *
 * Deterministik dan sinkron (mock). Saat backend siap, ganti pemanggil dengan
 * `POST /api/import/analyze` yang meng-clone repo / membongkar arsip lalu
 * mendeteksi framework dari manifest nyata (`package.json`, `go.mod`, dst).
 */
export function analyzeSource(source: ProjectSource): ProjectSource {
  const hint = source.fileName ?? source.repoUrl ?? ""
  return {
    ...source,
    detectedStack: detectStackFromName(hint),
    analyzedAtLabel: "baru saja",
  }
}

/* -------------------------------------------------------------------------- */
/*  Internal                                                                  */
/* -------------------------------------------------------------------------- */

function parseHost(url: string): string {
  try {
    return new URL(url.trim()).hostname.toLowerCase()
  } catch {
    return ""
  }
}

/** Loopback, private range, dan .local — tolak sebagai target SSRF. */
function isPrivateHost(host: string): boolean {
  if (!host) return true
  if (host === "localhost" || host.endsWith(".local")) return true
  if (host === "0.0.0.0" || host === "::1") return true
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])]
    if (a === 127 || a === 10 || a === 0) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
  }
  return false
}