import Link from "next/link"
import { ArrowLeft, Boxes, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-4 w-4" />
        </div>
        OmniStack
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Lupa Kata Sandi
          </CardTitle>
          <CardDescription>
            Masukkan email Anda dan kami akan mengirim tautan reset password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="nama@perusahaan.com"
              required
            />
          </div>
          {/* Mock MVP — belum ada backend kirim email */}
          <Button className="w-full" disabled>
            Kirim Tautan Reset
            <span className="ml-auto text-xs opacity-70">Segera</span>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ingat password Anda?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Kembali ke Login
            </Link>
          </p>
        </CardContent>
      </Card>

      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke halaman utama
      </Link>
    </div>
  )
}
