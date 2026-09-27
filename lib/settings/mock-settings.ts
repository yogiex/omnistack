/**
 * Mock data untuk halaman Settings. Dipisah dari komponen supaya
 * `settings-client.tsx` hanya menangani state dan komposisi.
 */

export interface ApiKeyItem {
  id: string
  name: string
  /** Disimpan penuh di client karena ini mock. Di produksi key hanya
   *  ditampilkan sekali saat dibuat, lalu server menyimpan hash-nya. */
  fullKey: string
  createdAt: string
}

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: "key-1",
    name: "Production Deploy",
    fullKey: "osk_live_9f8e7d6c5b4a3210",
    createdAt: "12 Jan 2026",
  },
  {
    id: "key-2",
    name: "CI Pipeline",
    fullKey: "osk_test_1a2b3c4d5e6f7788",
    createdAt: "03 Mar 2026",
  },
  {
    id: "key-3",
    name: "Local Development",
    fullKey: "osk_dev_aa11bb22cc33dd44",
    createdAt: "21 Jun 2026",
  },
]

export interface NotifPrefs {
  deploymentAlerts: boolean
  systemAlerts: boolean
  marketingEmails: boolean
  realtimeAlerts: boolean
  dailyDigest: boolean
}

export const INITIAL_NOTIF_PREFS: NotifPrefs = {
  deploymentAlerts: true,
  systemAlerts: true,
  marketingEmails: false,
  realtimeAlerts: true,
  dailyDigest: true,
}

export const NOTIF_OPTION_GROUPS: {
  group: string
  options: { key: keyof NotifPrefs; label: string }[]
}[] = [
  {
    group: "Notifikasi Email",
    options: [
      { key: "deploymentAlerts", label: "Deployment alerts" },
      { key: "systemAlerts", label: "System alerts" },
      { key: "marketingEmails", label: "Marketing emails" },
    ],
  },
  {
    group: "Notifikasi In-App",
    options: [
      { key: "realtimeAlerts", label: "Real-time alerts" },
      { key: "dailyDigest", label: "Daily digest" },
    ],
  },
]

export interface MockSession {
  id: string
  device: string
  detail: string
  current: boolean
}

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: "sess-1",
    device: "Chrome on MacOS",
    detail: "Sesi saat ini",
    current: true,
  },
  {
    id: "sess-2",
    device: "Safari on iPhone",
    detail: "2 jam lalu",
    current: false,
  },
]

/** Mask API key — 9 char awal + 4 char akhir, sisanya titik. */
export function maskKey(fullKey: string): string {
  return `${fullKey.slice(0, 9)}••••${fullKey.slice(-4)}`
}
