import type { UseQueryResult } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { Spinner } from "@/src/components/core/components/Spinner"

export type SubsectionMcpDraftApplyState = "ready" | "pending" | "error" | "missing"

export function subsectionMcpDraftApplyState(
  applyMcpDraft: boolean,
  query: Pick<UseQueryResult, "isPending" | "isError" | "data">,
): SubsectionMcpDraftApplyState {
  if (!applyMcpDraft) return "ready"
  if (query.isPending) return "pending"
  if (query.isError) return "error"
  if (!query.data) return "missing"
  return "ready"
}

type SubsectionMcpDraftApplyGateProps = {
  state: SubsectionMcpDraftApplyState
  children: ReactNode
}

export function SubsectionMcpDraftApplyGate({ state, children }: SubsectionMcpDraftApplyGateProps) {
  if (state === "pending") return <Spinner />

  if (state === "error") {
    return (
      <p className="text-sm text-red-700">
        Der MCP-Vorschlag konnte nicht geladen werden. Bitte Seite neu laden oder den Vorschlag in
        der Admin-Übersicht verwerfen.
      </p>
    )
  }

  if (state === "missing") {
    return (
      <p className="text-sm text-amber-800">
        Kein MCP-Vorschlag für diese URL gefunden. Der Vorschlag wurde möglicherweise bereits
        übernommen oder verworfen.
      </p>
    )
  }

  return children
}
