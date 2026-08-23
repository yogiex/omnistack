"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  Brain,
  Bot,
  Bug,
  Code2,
  CreditCard,
  Crown,
  Database,
  Eye,
  Gauge,
  GitPullRequest,
  LayoutDashboard,
  Rocket,
  ScrollText,
  Server,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import type { Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const ROLE_META: Record<
  Role,
  { icon: typeof Crown; label: string; color: string }
> = {
  ADMIN: { icon: Crown, label: "Administrator", color: "text-amber-500" },
  USER: { icon: Code2, label: "Developer", color: "text-blue-500" },
  VIEWER: { icon: Eye, label: "Viewer", color: "text-emerald-500" },
}

interface NavItem {
  title: string
  url: string
  icon: typeof Boxes
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const meta = ROLE_META[user.role]
  const RoleIcon = meta.icon

  // Navigasi dasar — semua role
  const workspaceItems: NavItem[] = [
    {
      title: "Overview",
      url: user.role === "ADMIN" ? "/admin" : "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title:
        user.role === "ADMIN"
          ? "All Projects"
          : user.role === "VIEWER"
            ? "Shared Projects"
            : "My Projects",
      url: "/projects",
      icon: Boxes,
    },
    { title: "Deployments", url: "/deployments", icon: Rocket },
    { title: "Monitoring", url: "/monitoring", icon: Gauge },
    { title: "Error Tracking", url: "/error-tracking", icon: Bug },
    // VIEWER tidak punya akses /gitops dan /ai-architect (lihat route access map)
    ...(user.role !== "VIEWER"
      ? [
          {
            title: "Preview Environments",
            url: "/gitops",
            icon: GitPullRequest,
          } satisfies NavItem,
        ]
      : []),
    { title: "FinOps", url: "/finops", icon: Wallet },
    ...(user.role !== "VIEWER"
      ? [
          {
            title: "AI Architect",
            url: "/ai-architect",
            icon: Sparkles,
          } satisfies NavItem,
          {
            title: "AI Code Reviewer",
            url: "/ai-reviewer",
            icon: Brain,
          } satisfies NavItem,
        ]
      : []),
  ]

  // Khusus ADMIN
  const adminItems: NavItem[] =
    user.role === "ADMIN"
      ? [
          { title: "User Management", url: "/admin/users", icon: Users },
          { title: "Databases", url: "/admin/databases", icon: Database },
          { title: "Audit Logs", url: "/admin/audit", icon: ScrollText },
          { title: "System Settings", url: "/admin/settings", icon: Settings },
          { title: "Infrastructure", url: "/admin/infrastructure", icon: Server },
          { title: "AI Config", url: "/admin/ai-config", icon: Bot },
          { title: "Billing", url: "/admin/billing", icon: CreditCard },
        ]
      : []

  // Footer nav — semua role
  const footerItems: NavItem[] = [
    { title: "Settings", url: "/settings", icon: Settings },
  ]

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} className="w-full block">
                  <SidebarMenuButton
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary/10 text-primary"
                    )}
                    isActive={isActive}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar>
      {/* Header dengan identitas role */}
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-lg leading-tight">OmniStack</p>
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                meta.color
              )}
            >
              <RoleIcon className="h-3 w-3" />
              {meta.label}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Workspace", workspaceItems)}
        {adminItems.length > 0 && renderGroup("Administrasi", adminItems)}
        {renderGroup("Akun", footerItems)}
      </SidebarContent>

      {/* Info khusus VIEWER */}
      {user.role === "VIEWER" && (
        <SidebarFooter className="border-t p-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium">
              <Eye className="h-3 w-3" />
              Read-only mode
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Anda hanya bisa melihat data. Semua tombol aksi dinonaktifkan.
            </p>
            <Badge variant="outline" className="mt-2 text-[10px]">
              {user.email}
            </Badge>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
