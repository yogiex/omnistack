# Node: lib-source-utils

| Field | Value |
|-------|-------|
| Class | UtilModule |
| Files | lib/source-utils.ts |
| Status | stable |

## Purpose

Fungsi murni untuk fitur import/deploy source (upload arsip + Git URL):
deteksi provider Git, validasi URL/branch (anti-SSRF & anti command-injection),
format ukuran file, ekstraksi nama repo, slugify domain, dan analisis stack mock.
Belum ada backend — `analyzeSource()` deterministik; ganti ke
`POST /api/import/analyze` saat server siap.

## Relations

### usedBy ←
- [[component-project-import-wizard]]
- [[page-projects]]

## Gotchas

- `validateGitUrl()` & `isValidBranchRef()` adalah gerbang **client** — WAJIB
  diulang di server; client bukan batas kepercayaan (lihat
  `next-update-fitur-git-integration.md` §7).
- Hanya `https` yang diterima; `http`/`ssh`/`git`/`file` ditolak. Host
  loopback/private (127/10/0/192.168/172.16-31/.local) ditolak anti-SSRF.
- `isValidBranchRef` menolak `..` dan hanya menerima `^[A-Za-z0-9._/-]+$`.
- `formatBytes()` sengaja deterministik (bukan `toLocaleString`) agar tidak
  hydration mismatch Node vs browser.
- Prefix output yang tak cocok pola provider = `"generic"`, bukan error.