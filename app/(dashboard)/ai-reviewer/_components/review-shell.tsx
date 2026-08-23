"use client"

import { useReducer } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DashboardView } from "./dashboard/dashboard-view"
import { ResultsView } from "./results/results-view"
import { FindingDetailSheet } from "./finding-detail-sheet"

type ViewState =
  | { view: "dashboard" }
  | { view: "results"; reviewId: string }
  | { view: "finding"; reviewId: string; findingId: string }

type ViewAction =
  | { type: "SELECT_REVIEW"; reviewId: string }
  | { type: "SELECT_FINDING"; findingId: string }
  | { type: "GO_BACK" }
  | { type: "GO_DASHBOARD" }

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SELECT_REVIEW":
      return { view: "results", reviewId: action.reviewId }
    case "SELECT_FINDING":
      if (state.view !== "results") return state
      return { view: "finding", reviewId: state.reviewId, findingId: action.findingId }
    case "GO_BACK":
      if (state.view === "finding") return { view: "results", reviewId: state.reviewId }
      if (state.view === "results") return { view: "dashboard" }
      return state
    case "GO_DASHBOARD":
      return { view: "dashboard" }
  }
}

export function ReviewShell() {
  const [state, dispatch] = useReducer(viewReducer, { view: "dashboard" })

  return (
    <div className="flex flex-col gap-6">
      {state.view !== "dashboard" && (
        <Button
          variant="ghost"
          className={cn("w-fit gap-2 text-muted-foreground")}
          onClick={() => dispatch({ type: "GO_BACK" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {state.view === "finding" ? "results" : "reviews"}
        </Button>
      )}

      {state.view === "dashboard" && (
        <DashboardView
          onSelectReview={(id) => dispatch({ type: "SELECT_REVIEW", reviewId: id })}
        />
      )}

      {state.view === "results" && (
        <ResultsView
          reviewId={state.reviewId}
          onSelectFinding={(id) => dispatch({ type: "SELECT_FINDING", findingId: id })}
        />
      )}

      {state.view === "finding" && (
        <FindingDetailSheet
          reviewId={state.reviewId}
          findingId={state.findingId}
          onClose={() => dispatch({ type: "GO_BACK" })}
        />
      )}
    </div>
  )
}
