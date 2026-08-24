import { RouteGuard } from "@/components/route-guard"

export default function IdeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard>
      <div className="h-svh w-full overflow-hidden bg-background">
        {children}
      </div>
    </RouteGuard>
  )
}
