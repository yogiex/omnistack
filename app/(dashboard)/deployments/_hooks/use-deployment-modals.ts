"use client"

import { useCallback, useMemo, useState } from "react"

import type { MockDeployment } from "@/lib/mock-data"

/**
 * State modal sebagai satu discriminated union, bukan 8 `useState`
 * terpisah. Orchesterator lama harus menjaga `detailModalOpen` +
 * `detailDeploymentId` tetap sinkron dua arah, dan satu klik salah bisa
 * membuka detail untuk deployment yang berbeda. Dengan union, `type`
 * menentukan `deploymentId` — tidak mungkin tidak sinkron.
 */
type ModalState =
  | { type: "closed" }
  | { type: "detail"; deploymentId: string }
  | { type: "rollback"; deploymentId: string }
  | { type: "ai-diagnose"; deploymentId: string }
  | { type: "new" }

export function useDeploymentModals(deployments: MockDeployment[]) {
  const [state, setState] = useState<ModalState>({ type: "closed" })

  const openDetail = useCallback(
    (deploymentId: string) => setState({ type: "detail", deploymentId }),
    [],
  )
  const openRollback = useCallback(
    (deploymentId: string) => setState({ type: "rollback", deploymentId }),
    [],
  )
  const openAIDiagnose = useCallback(
    (deploymentId: string) => setState({ type: "ai-diagnose", deploymentId }),
    [],
  )
  const openNew = useCallback(() => setState({ type: "new" }), [])
  const close = useCallback(() => setState({ type: "closed" }), [])

  // Resolve id → objek sekali per perubahan, bukan `find()` di render body.
  const byId = useMemo(() => {
    const map = new Map<string, MockDeployment>()
    for (const d of deployments) map.set(d.id, d)
    return map
  }, [deployments])

  const resolve = (id: string) => byId.get(id)

  const active = state.type === "closed" || state.type === "new"
    ? undefined
    : resolve(state.deploymentId)

  return {
    state,
    // Satu objek untuk tiga modal: hanya salah satu yang bisa non-null
    // pada satu waktu, jadi orchestrator tinggal baca `m.target`.
    target: active,
    openDetail,
    openRollback,
    openAIDiagnose,
    openNew,
    close,
  }
}
