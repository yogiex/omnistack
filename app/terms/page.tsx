import Link from "next/link"
import { ArrowLeft, Boxes } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-4 w-4" />
        </div>
        OmniStack
      </Link>

      <h1 className="mt-10 text-3xl font-bold tracking-tight">Persyaratan Layanan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Terakhir diperbarui: Agustus 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 font-semibold text-foreground">1. Layanan</h2>
          <p>
            OmniStack adalah platform PaaS bermodel Bring Your Own Cloud (BYOC).
            Anda tetap memegang kepemilikan penuh atas VPS, data, dan source code
            Anda. Kami hanya menyediakan lapisan orkestrasi dan antarmuka.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-foreground">2. Akun & Role</h2>
          <p>
            Akun ditetapkan dengan salah satu role: ADMIN, USER, atau VIEWER.
            Setiap role memiliki hak akses berbeda sebagaimana dijelaskan pada
            dokumentasi Role System. Anda bertanggung jawab menjaga kerahasiaan
            kredensial akun Anda.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-foreground">3. Penggunaan yang Wajar</h2>
          <p>
            Dilarang menggunakan layanan untuk aktivitas ilegal, distribusi
            malware, penambangan kripto tanpa izin, atau penyalahgunaan resource
            yang mengganggu pengguna lain di cluster bersama.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-semibold text-foreground">4. Halaman Demo</h2>
          <p>
            Versi ini adalah demo MVP frontend — seluruh data bersifat mock dan
            tidak ada transaksi nyata. Ketentuan final akan menyusul sebelum
            rilis publik.
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
