/**
 * Mock data + tipe untuk Error Tracking.
 * Dipisah dari komponen supaya halaman cumaurus render, dan supaya
 * `lib/mock-data.ts` tidak makin gemuk — file itu sudah 1100 baris dan
 * menanggung users/projects/deployments/databases/logs.
 */

export type ErrorStatus = "New" | "Investigating" | "Resolved"
export type ErrorSeverity = "Critical" | "Warning" | "Info"

export interface TrackedError {
  id: string
  message: string
  stackSnippet: string
  fullStack: string
  /**
   * Nama proyek (denormalized). Nilainya sengaja `string`, bukan
   * `projectId`, supaya mock ini bisa ditulis tanpa melihat `MOCK_PROJECTS`.
   * Konsekuensinya: kalau proyek di-rename, data ini tidak ikut berubah
   * dan filter berbasis nama akan gagal diam-diam. Kalau datanya sudah
   * berasal dari backend, ganti ke `projectId` dan resolve namanya saat
   * render.
   */
  project: string
  count: number
  firstSeen: string
  lastSeen: string
  status: ErrorStatus
  severity: ErrorSeverity
  /**
   * Jumlah user yang mengalami error ini. Bisa overlap dengan error lain —
   * jadi menjumlahkannya bukan "unique users", dan UI harus jujur soal itu.
   */
  affectedUsers: number
  suggestedFix: string
  /** Id user yang di-assign, `undefined` kalau belum ada. */
  assigneeId?: string
}

export const MOCK_ERRORS: TrackedError[] = [
  {
    id: "err-001",
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    stackSnippet: "at ProductList.render (components/product-list.tsx:42:18)",
    fullStack: `TypeError: Cannot read properties of undefined (reading 'map')
  at ProductList.render (components/product-list.tsx:42:18)
  at processChild (node_modules/react-dom/cjs/react-dom.development.js:3434:18)
  at reconcileChildren (node_modules/react-dom/cjs/react-dom.development.js:4296:14)
  at reconcileChildFibers (node_modules/react-dom/cjs/react-dom.development.js:4329:26)
  at reconcileChildren (node_modules/react-dom/cjs/react-dom.development.js:4369:24)
  at updateHostComponent (node_modules/react-dom/cjs/react-dom.development.js:4720:18)`,
    project: "E-Commerce Platform",
    count: 234,
    firstSeen: "2 hari lalu",
    lastSeen: "5 menit lalu",
    status: "New",
    severity: "Critical",
    affectedUsers: 189,
    suggestedFix:
      "Tambah null check sebelum memanggil .map() pada props.products. Pastikan fallback ke array kosong: (products ?? []).map(...)",
  },
  {
    id: "err-002",
    message: "OpenAI APIError: Rate limit exceeded (429)",
    stackSnippet: "at ChatHandler.process (lib/chat-handler.ts:87:12)",
    fullStack: `OpenAI APIError: Rate limit exceeded (429)
  at ChatHandler.process (lib/chat-handler.ts:87:12)
  at async POST (app/api/chat/route.ts:15:18)
  at async /node_modules/next/dist/server/future/route-modules/app-route/module.js:50:21`,
    project: "AI Chatbot",
    count: 87,
    firstSeen: "1 hari lalu",
    lastSeen: "12 menit lalu",
    status: "Investigating",
    severity: "Warning",
    affectedUsers: 45,
    suggestedFix:
      "Implement exponential backoff dan retry queue. Pertimbangkan caching response untuk query yang sering sama.",
  },
  {
    id: "err-003",
    message: "DatabaseError: Connection pool exhausted (max: 20)",
    stackSnippet: "at Pool.connect (lib/db/pool.ts:34:15)",
    fullStack: `DatabaseError: Connection pool exhausted (max: 20)
  at Pool.connect (lib/db/pool.ts:34:15)
  at async query (lib/db/index.ts:12:18)
  at async GET (app/api/projects/route.ts:8:20)`,
    project: "SaaS Dashboard",
    count: 156,
    firstSeen: "3 hari lalu",
    lastSeen: "20 menit lalu",
    status: "New",
    severity: "Critical",
    affectedUsers: 312,
    suggestedFix:
      "Tingkatkan pool limit atau tambah connection pooling dengan PgBouncer. Audit query yang tidak di-close.",
  },
  {
    id: "err-004",
    message: "TimeoutError: Function timed out after 30000ms",
    stackSnippet: "at withTimeout (lib/timeout.ts:8:11)",
    fullStack: `TimeoutError: Function timed out after 30000ms
  at withTimeout (lib/timeout.ts:8:11)
  at async generateReport (lib/report-generator.ts:22:5)
  at async POST (app/api/reports/route.ts:10:18)`,
    project: "SaaS Dashboard",
    count: 42,
    firstSeen: "5 hari lalu",
    lastSeen: "1 jam lalu",
    status: "Resolved",
    severity: "Warning",
    affectedUsers: 28,
    suggestedFix:
      "Optimasi query untuk report generation — gunakan aggregation pipeline dan pagination.",
  },
  {
    id: "err-005",
    message: "SyntaxError: Unexpected token '<' in JSON at position 0",
    stackSnippet: "at JSON.parse (<anonymous>) at fetchProjects (lib/api.ts:15:20)",
    fullStack: `SyntaxError: Unexpected token '<' in JSON at position 0
  at JSON.parse (<anonymous>)
  at fetchProjects (lib/api.ts:15:20)
  at async ProjectsPage (app/projects/page.tsx:12:18)`,
    project: "Portfolio Website",
    count: 18,
    firstSeen: "1 minggu lalu",
    lastSeen: "3 jam lalu",
    status: "Resolved",
    severity: "Info",
    affectedUsers: 5,
    suggestedFix:
      "Server mengembalikan HTML error page bukan JSON. Tambahkan check response.ok sebelum JSON.parse.",
  },
  {
    id: "err-006",
    message: "PaymentError: Stripe signature verification failed",
    stackSnippet: "at verifyWebhook (lib/stripe.ts:28:9)",
    fullStack: `PaymentError: Stripe signature verification failed
  at verifyWebhook (lib/stripe.ts:28:9)
  at async POST (app/api/webhook/route.ts:12:18)
  at async /node_modules/next/dist/server/future/route-modules/app-route/module.js:50:21`,
    project: "E-Commerce Platform",
    count: 31,
    firstSeen: "4 hari lalu",
    lastSeen: "6 jam lalu",
    status: "Investigating",
    severity: "Critical",
    affectedUsers: 67,
    suggestedFix:
      "Periksa STRIPE_WEBHOOK_SECRET — kemungkinan key berubah setelah rotate. Pastikan raw body dikirim ke Stripe.",
  },
  {
    id: "err-007",
    message: "ImageError: Failed to optimize image — exceeds 4MB limit",
    stackSnippet: "at optimizeImage (lib/image-optimizer.ts:12:7)",
    fullStack: `ImageError: Failed to optimize image — exceeds 4MB limit
  at optimizeImage (lib/image-optimizer.ts:12:7)
  at async uploadHandler (app/api/upload/route.ts:18:14)`,
    project: "Portfolio Website",
    count: 9,
    firstSeen: "2 minggu lalu",
    lastSeen: "1 hari lalu",
    status: "Resolved",
    severity: "Info",
    affectedUsers: 3,
    suggestedFix:
      "Tambah client-side resize sebelum upload atau tingkatkan limit di server-side dengan streaming.",
  },
  {
    id: "err-008",
    message: "WebSocketError: Connection closed abnormally (code: 1006)",
    stackSnippet: "at WebSocket.onclose (lib/ws-client.ts:45:10)",
    fullStack: `WebSocketError: Connection closed abnormally (code: 1006)
  at WebSocket.onclose (lib/ws-client.ts:45:10)
  at WebSocket.addEventListener (lib/ws-client.ts:22:5)`,
    project: "AI Chatbot",
    count: 22,
    firstSeen: "6 hari lalu",
    lastSeen: "2 jam lalu",
    status: "New",
    severity: "Warning",
    affectedUsers: 15,
    suggestedFix:
      "Implement reconnect dengan exponential backoff. Tambah heartbeat check setiap 30 detik.",
  },
]

/** Opsi dropdown — diturunkan dari union type, bukan ditulis manual. */
export const ERROR_STATUSES: ErrorStatus[] = [
  "New",
  "Investigating",
  "Resolved",
]

export const ERROR_SEVERITIES: ErrorSeverity[] = [
  "Critical",
  "Warning",
  "Info",
]
