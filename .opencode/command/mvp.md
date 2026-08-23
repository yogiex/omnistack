---
description: Implement fitur MVP OmniStack end-to-end via mvp-implementer lalu review oleh code-reviewer.
---

Jalankan workflow pengembangan fitur MVP di OmniStack.

Permintaan fitur: $ARGUMENTS

## Workflow

### Fase 1 — Klarifikasi (jika perlu)
Jika permintaan ambigu (fitur tidak jelas, scope terlalu besar untuk satu
iterasi), tanyakan dulu ke user SEBELUM mulai. Jika cukup jelas, lanjut.

### Fase 2 — Tulis spec singkat
Buat ringkasan 5-10 baris: route, komponen yang dibutuhkan, data yang
ditampilkan, interaksi utama. Tampilkan ke user sebagai rencana singkat,
lalu lanjut implementasi (jangan tunggu persetujuan kecuali diminta).

### Fase 3 — Implementasi
Delegasikan ke agent `mvp-implementer` dengan spec dari Fase 2.
Agent ini akan otomatis: baca KG, ikuti skill omnistack-mvp-feature,
jalankan quality gate, dan update knowledge graph.

### Fase 4 — Review independen
Delegasikan hasil implementasi ke agent `code-reviewer`.
Kirim daftar file yang berubah + spec awal.

### Fase 5 — Perbaikan & pelaporan
- Jika verdict REQUEST_CHANGES/BLOCK: minta mvp-implementer memperbaiki
  temuan high/medium, jalankan ulang quality gate.
- Laporkan ringkasan akhir ke user:
  1. Apa yang dibangun + route URL
  2. File yang dibuat/diubah
  3. Hasil review + verdict akhir
  4. Status quality gate (PASS/FAIL)
  5. Node KG yang dibuat/diupdate
