# Node: lib-use-debounce

| Field | Value |
|-------|-------|
| Class | Lib |
| Files | hooks/use-debounce.ts |
| Status | stable |

## Purpose

Hook generic `useDebounce<T>(value, delay=300)` untuk menunda pembaruan state
sampai user berhenti mengetik. Dipakai halaman User Management agar search
tidak men-filter di setiap ketukan keyboard.

## Relations

### dependsOn →
- (none — React useEffect/setState only)

### usedBy ←
- [[page-admin-users]]

## Gotchas

- Default delay 300ms; sesuaikan via parameter kedua jika butuh respons lebih
  cepat/lambat.
- Nilai pertama langsung di-emit (tidak menunggu delay) — konsisten dengan
  pola "immediate first value".
