"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button" // Import styling tombol
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils" // Import utility untuk menggabungkan class
import { Moon, Sun, Search, LogOut, UserRound, Eye } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"

export function TopNav() {
  const { setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  // Belum ada sesi — jangan render apa pun (RouteGuard sedang memproses redirect)
  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />

      <div className="flex-1 flex items-center gap-2 text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 max-w-sm border">
        <Search className="h-4 w-4" />
        <input
          type="search"
          placeholder="Search projects, services, or docs..."
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
        />
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Indikator Read-Only untuk role VIEWER */}
        {user.role === "VIEWER" && (
          <Badge
            variant="outline"
            className="hidden gap-1.5 text-xs font-medium text-emerald-500 sm:flex"
          >
            <Eye className="h-3 w-3" />
            Read-Only
          </Badge>
        )}

        {/* Theme Toggle - Menggunakan buttonVariants langsung */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown - data dinamis dari sesi mock */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-8 w-8 rounded-full p-0")}>
            <Avatar className="h-8 w-8">
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.name} />
              )}
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            {/* GroupLabel Base UI wajib berada di dalam Menu.Group */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground pt-1">
                    Role: <span className="font-semibold">{user.role}</span>
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
