import Link from "next/link"
import { ArrowLeft, Boxes } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-4 w-4" />
        </div>
        OmniStack
      </Link>

      <h1 className="mt-10 text-3xl font-bold tracking-tight">Kebijakan Privasi</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Terakhir diperbarui: Agustus 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">1. Data yang Kami Simpan</h2>
          <p>
            OmniStack tidak pernah menyimpan source code Anda. Kami hanya
            menarik kode dari repositori Anda saat proses build berlangsung di
            server Anda sendiri. Data akun yang kami simpan terbatas pada nama,
            email, dan preferensi.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-foreground">2. Sesi Demo</h2>
          <p>
            Pada versi demo MVP ini, sesi login disimpan secara lokal di browser
            Anda (localStorage) dan tidak dikirim ke server mana pun.
            Membersihkan data browser akan menghapus seluruh sesi.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-foreground">3. Kepemilikan Data</h2>
          <p>
            Dengan model BYOC, seluruh data aplikasi dan database berada di
            infrastruktur milik Anda sendiri. Kami tidak memiliki akses ke
            isinya, dan tidak menjual atau membagikan data apa pun kepada pihak
            ketiga.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-foreground">4. Hak Anda</h2>
          <p>
            Anda dapat menghapus akun beserta seluruh datanya kapan saja dari
            halaman Settings. Untuk pertanyaan privasi lebih lanjut, hubungi
            hello@omnistack.dev.
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke halaman utama
      </Link>
    </div>
  )
}
