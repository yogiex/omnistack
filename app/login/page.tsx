"use client"

import Link from "next/link"
import { Boxes } from "lucide-react"
import { SiGithub } from "react-icons/si"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* ================= SISI KIRI: BRANDING & VISUAL (OmniStack Theme) ================= */}
      <div className="relative hidden bg-slate-950 lg:flex flex-col justify-between p-12 text-slate-50 overflow-hidden">
        {/* Efek Gradient Glow yang lebih "Tech" & "AI" */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950 to-slate-950" />
        
        {/* Glow Cyan (Mewakili Kode/Terminal) */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px]" />
        
        {/* Glow Violet (Mewakili AI & Inovasi) */}
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px]" />
        
        {/* Subtle Noise Texture untuk kesan premium & taktil */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">OmniStack</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            The Ultimate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              Developer Operating System.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Rangkai bahasa pemrograman dan library apa pun yang Anda inginkan. Biarkan AI kami yang menyatukannya menjadi infrastruktur produksi dalam hitungan detik.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>
              <span className="text-sm font-medium">Zero-Config CI/CD Pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20">
                <div className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
              </div>
              <span className="text-sm font-medium">AI Prompt Engineer Terintegrasi</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </div>
              <span className="text-sm font-medium">Multi-Node Auto-Scaling Cluster</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © 2026 OmniStack Inc. All rights reserved.
        </div>
      </div>

      {/* ================= SISI KANAN: FORM LOGIN ================= */}
      <div className="flex flex-col gap-4 p-6 md:p-10 lg:p-12 bg-background">
        {/* Logo Mobile */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg">OmniStack</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight">Selamat Datang Kembali</h2>
              <p className="text-sm text-muted-foreground">
                Masuk ke workspace Anda untuk melanjutkan deployment.
              </p>
            </div>

            <div className="space-y-4">
              {/* Tombol OAuth GitHub */}
              <Button variant="outline" className="w-full" size="lg">
                <SiGithub className="mr-2 h-4 w-4" />
                Lanjut dengan GitHub
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Atau lanjut dengan email
                  </span>
                </div>
              </div>

              {/* Form Login Email/Password */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nama@perusahaan.com" 
                    required 
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                      Lupa kata sandi?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="h-11"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                    Ingat saya selama 30 hari
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11 text-base" size="lg">
                  Masuk
                </Button>
              </form>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                Daftar Workspace Baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}