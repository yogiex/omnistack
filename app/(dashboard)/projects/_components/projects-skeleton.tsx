import { Skeleton } from "@/components/ui/skeleton"

const STAT_KEYS = ["stat-1", "stat-2", "stat-3", "stat-4"] as const
const CARD_KEYS = [
  "card-1",
  "card-2",
  "card-3",
  "card-4",
  "card-5",
  "card-6",
] as const

interface ProjectsSkeletonProps {
  showStats?: boolean
}

export function ProjectsSkeleton({ showStats }: ProjectsSkeletonProps) {
  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STAT_KEYS.map((key) => (
            <Skeleton key={key} className="h-32 rounded-xl" />
          ))}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CARD_KEYS.map((key) => (
          <Skeleton key={key} className="h-[280px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
