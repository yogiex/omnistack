import { Activity, CheckCircle2, Clock, Rocket, XCircle } from "lucide-react"
import type { KpiGridConfig } from "@/lib/kpi/types"
import type { MockDeployment } from "@/lib/mock-data"

export interface DeploymentsKpiData {
  deployments: MockDeployment[]
  /** Total deployment di luar cakupan role (untuk konteks ADMIN) */
  totalInSystem: number
}

export const deploymentsKpis: KpiGridConfig<DeploymentsKpiData> = {
  cols: 4,
  title: "Ringkasan Deployment",
  items: [
    {
      id: "total",
      label: "Total Deployment",
      accent: "violet",
      icon: <Rocket />,
      value: (d) => d.deployments.length.toLocaleString("id-ID"),
      tooltip:
        "Deployment dalam cakupan role: ADMIN melihat semua, USER hanya miliknya, VIEWER hanya yang di-share.",
      href: "/deployments",
    },
    {
      id: "success-rate",
      label: "Success Rate",
      accent: "emerald",
      icon: <CheckCircle2 />,
      value: (d) => {
        if (d.deployments.length === 0) return "—"
        const ok = d.deployments.filter((x) => x.status === "success").length
        return `${Math.round((ok / d.deployments.length) * 100)}%`
      },
      progress: (d) => {
        if (d.deployments.length === 0) return 0
        const ok = d.deployments.filter((x) => x.status === "success").length
        return (ok / d.deployments.length) * 100
      },
      tooltip: "Rasio deployment berstatus \"success\".",
    },
    {
      id: "failed",
      label: "Gagal",
      accent: "rose",
      icon: <XCircle />,
      value: (d) =>
        d.deployments.filter((x) => x.status === "failed").length.toLocaleString(
          "id-ID"
        ),
      tooltip: "Deployment berstatus \"failed\" — perlu investigasi.",
      href: "/deployments",
      visible: (d) => d.deployments.some((x) => x.status === "failed"),
    },
    {
      id: "building",
      label: "Sedang Build",
      accent: "blue",
      icon: <Clock />,
      value: (d) =>
        d.deployments.filter((x) => x.status === "building").length.toLocaleString(
          "id-ID"
        ),
      tooltip: "Deployment berstatus \"building\" atau \"queued\".",
      visible: (d) =>
        d.deployments.some(
          (x) => x.status === "building" || x.status === "queued"
        ),
    },
    {
      id: "queued",
      label: "Antrean",
      accent: "default",
      icon: <Activity />,
      value: (d) =>
        d.deployments.filter((x) => x.status === "queued").length.toLocaleString(
          "id-ID"
        ),
      tooltip: "Deployment berstatus \"queued\" menunggu runner.",
      visible: (d) => d.deployments.some((x) => x.status === "queued"),
    },
  ],
}
