import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

// Vendored Inter variable font so Docker builds need no network access to Google Fonts
const inter = localFont({
  src: "../public/fonts/Inter-Variable.woff2",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OmniStack - The Developer Operating System",
  description: "Rangkai bahasa pemrograman dan library apa pun yang Anda inginkan.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}