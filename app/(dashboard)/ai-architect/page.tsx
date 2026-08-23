import type { Metadata } from "next"
import { RouteGuard } from "@/components/route-guard"
import { AIStudio } from "./_components/ai-studio"

export const metadata: Metadata = {
  title: "AI Architect Studio - OmniStack",
  description: "Generate full-stack applications with AI Prompt Engineering",
}

export default function AIArchitectPage() {
  return (
    <RouteGuard requiredRole="USER">
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
        <AIStudio />
      </div>
    </RouteGuard>
  )
}
