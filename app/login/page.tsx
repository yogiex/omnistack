import Link from "next/link"
import { Boxes, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Sisi Kiri: Branding & Visual */}
      <div className="relative hidden bg-zinc-900 lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        {/* Efek Gradient Glow di Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-zinc-900 to-purple-600/20" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-zinc-900">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">OmniStack</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">
            The Ultimate <br /> Developer Operating System.
          </h1>
          <p className="text-lg text-zinc-400">
            Rangkai bahasa pemrograman dan library apa pun yang Anda inginkan. Biarkan AI kami yang menyatukannya menjadi infrastruktur produksi dalam hitungan detik.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <span>Zero-Config CI/CD Pipeline</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
              </div>
              <span>AI Prompt Engineer Terintegrasi</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              <span>Multi-Node Auto-Scaling Cluster</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          © 2026 OmniStack Inc. All rights reserved.
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="flex flex-col gap-4 p-6 md:p-10 lg:p-12">
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
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Masuk ke workspace Anda untuk melanjutkan deployment.
              </p>
            </div>

            <div className="space-y-4">
              {/* Tombol OAuth GitHub (Khas Developer Tools) */}
              <Button variant="outline" className="w-full" size="lg">
                <GitBranch className="mr-2 h-4 w-4" />
                Continue with Git
                </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Form Login Email/Password */}
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="mirage@omnistack.dev" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                    Remember me for 30 days
                  </Label>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Sign In
                </Button>
              </form>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="#" className="font-medium text-primary underline-offset-4 hover:underline">
                Daftar Workspace Baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}