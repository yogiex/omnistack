# Architecture Decisions Log

> Catat keputusan arsitektur + alasannya. Satu entri per keputusan.
> Agent membaca file ini agar tidak menegosiasi ulang keputusan yang sudah final.

## Format

```
## YYYY-MM-DD — <judul keputusan>
- Context: <masalah/kebutuhan>
- Decision: <keputusan>
- Rationale: <mengapa>
- Alternatives rejected: <opsi lain yang ditolak + kenapa>
```

## Entries

### 2026-08-23 — Inisialisasi memory externalization
- Context: Agent lupa konteks antar sesi; prompt berulang untuk hal yang sama.
- Decision: State persisten disimpan di `.opencode/memory/` (filesystem),
  bukan di context window.
- Rationale: Filesystem unlimited, persistent, dan langsung operable oleh
  agent (pola Manus). Tidak makan token saat tidak direferensikan.
- Alternatives rejected: Database (overkill, project masih mock-data),
  context window (ephemeral, hilang tiap sesi).
