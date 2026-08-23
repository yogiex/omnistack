import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { RouteGuard } from "@/components/route-guard"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Top Nav diletakkan di sini */}
          <TopNav />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RouteGuard>
  )
}
