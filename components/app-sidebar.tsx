"use client"

import Link from "next/link"
import { LayoutDashboard, Server, GitBranch, BrainCircuit, Settings, Boxes } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: Boxes },
  { title: "Deployments", url: "/deployments", icon: Server },
  { title: "Git Repos", url: "/repos", icon: GitBranch },
  { title: "AI Architect", url: "/ai-architect", icon: BrainCircuit },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-4 w-4" />
        </div>
        <span className="font-bold text-lg">OmniStack</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* Menggunakan next/link dan menghapus asChild */}
                  <Link href={item.url} className="w-full block">
                    <SidebarMenuButton className="w-full justify-start">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}