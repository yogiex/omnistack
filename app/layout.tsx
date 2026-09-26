import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth-context"
import { PaletteProvider } from "@/lib/theme/palette-provider"

// Vendored Inter variable font so Docker builds need no network access to Google Fonts
const inter = localFont({
  src: "../public/fonts/Inter-Variable.woff2",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OmniStack - The Developer Operating System",
  description: "Rangkai bahasa pemrograman dan library apa pun yang Anda inginkan.",
}

// themeColor harus di `viewport`, bukan `metadata` (Next.js App Router).
// Nilainya mengikuti warna dasar app/icon.svg agar browser chrome senada.
export const viewport: Viewport = {
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/*
          Init script anti-FOUC: pasang `data-palette` dari localStorage SEBELUM
          paint pertama, supaya tidak ada flash palette default → palette tersimpan.
          `try/catch` wajib: localStorage bisa throw di private mode / Safari.
        */}
        <Script id="palette-init" strategy="beforeInteractive">
          {`try{var p=localStorage.getItem('omnistack-palette');if(p)document.documentElement.setAttribute('data-palette',p)}catch(e){}`}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PaletteProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </PaletteProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}