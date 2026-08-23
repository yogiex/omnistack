# OmniStack KG Ontology (TBox)

> Skema/klasifikasi untuk semua node di `docs/kg/nodes/`. Node adalah **instance** (ABox);
> file ini mendefinisikan **kelas, hierarki kelas, dan kosakata relasi** yang valid.
> Setiap node WAJIB mendeklarasikan `Class`-nya di tabel metadata dan hanya boleh
> memakai relasi dari tabel Object Properties di bawah.

## 1. Class Hierarchy (taksonomi)

```
Entity
├── Artifact                  — sesuatu yang ada di kode
│   ├── Page                  — route di app/**
│   │   ├── MarketingPage     — publik: landing, privacy, terms
│   │   ├── AuthPage          — login, register, forgot-password
│   │   └── DashboardPage     — di dalam app/(dashboard)/
│   ├── Component             — components/** atau _components/
│   │   ├── UIComponent       — presentasional murni (badge, nav)
│   │   └── GuardComponent    — kontrol akses/routing (route-guard)
│   └── LibModule             — lib/**
│       ├── ContextModule     — React context/provider
│       ├── DataModule        — data mock/fixtures + helper RBAC
│       └── UtilModule        — fungsi utilitas murni
├── Concept                   — pengetahuan lintas-file
│   ├── Pattern               — cara benar melakukan sesuatu
│   └── Constraint            — larangan/gotcha struktural
└── Document                  — dokumen root repo (*.md di root)
```

**Aturan klasifikasi:**
- Node wajib memakai kelas **paling spesifik** (bukan `Page` kalau bisa `DashboardPage`).
- Satu node = satu kelas. Tidak ada multiple inheritance.
- Kelas baru hanya boleh dibuat dengan menambah cabang di hierarki ini — bukan inline di node.
- Prefix nama file tetap mengikuti tipe level-2 (`page-`, `component-`, `lib-`, `concept-`);
  subclass diturunkan dari field `Class`, bukan dari prefix.

## 2. Object Properties (kosakata relasi)

| Relasi | Domain → Range | Inverse | Arti |
|--------|----------------|---------|------|
| `dependsOn` | Artifact → Artifact | usedBy | dependensi import/kompilasi |
| `renders` | Page → UIComponent | renderedBy | page menampilkan component |
| `guards` | GuardComponent → Page | guardedBy | component melindungi akses page |
| `providesContext` | ContextModule → Artifact | consumesContext | provider membungkus artifact |
| `classifies` | Pattern/Constraint → Artifact | governedBy | konsep berlaku pada artifact |
| `documents` | Document → Entity | documentedBy | dokumen menjelaskan entitas |

**Aturan relasi:**
- Hanya relasi di atas yang valid. Relasi baru = amendemen ontologi ini dulu.
- Semua relasi bersifat simetri-lewat-inverse: tulis di kedua sisi
  (A `dependsOn→` B ⟺ B `usedBy←` A). Validator mengecek ini.
- `dependsOn` adalah fallback jika relasi spesifik tidak cocok; jangan dobel
  (kalau sudah `renders`, jangan tambah `dependsOn` juga).

## 3. Datatype Properties (metadata node)

| Properti | Tipe | Wajib | Catatan |
|----------|------|-------|---------|
| `Class` | kelas dari §1 | ✅ | paling spesifik |
| `Files` | path relative repo root | ✅ | ≥1 path |
| `Status` | stable \| wip \| deprecated | ✅ | |

## 4. Inferensi Praktis (untuk agent)

Tanpa reasoner, agent boleh menarik kesimpulan murah ini:
1. **Pewarisan constraint**: node `classifies←` sebuah Constraint → patuhi constraint itu
   saat menyentuh node tersebut (sama seperti Gotchas).
2. **Transitivitas konteks**: Page yang `renders` Component X, dan X `consumesContext`
   ContextModule C → page butuh C terpasang di ancestor layout-nya.
3. **Blast radius**: mengubah LibModule L → semua node dengan `dependsOn→ L`
   (langsung) perlu direview; node via `renders` dihitung transitif.
4. **Kelas menentukan template pertanyaan**: `DashboardPage` pasti bertanya
   "siapa guard-nya?" — kalau tidak ada relasi `guards`, itu red flag data graf.

## 5. Sintaks Penulisan Relasi di Node

```markdown
## Relations

### dependsOn →
- [[lib-utils]]

### usedBy ←
- [[page-dashboard]]
```

Heading H3 = nama relasi + arah panah (`→` keluar, `←` masuk via inverse).
Validator memetakan inverse otomatis: `dependsOn↔usedBy`, `renders↔renderedBy`,
`guards↔guardedBy`, `providesContext↔consumesContext`, `classifies↔governedBy`,
`documents↔documentedBy`.
