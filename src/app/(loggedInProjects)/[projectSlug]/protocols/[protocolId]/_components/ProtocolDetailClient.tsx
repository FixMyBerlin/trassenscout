"use client"

import { ProtocolSummary } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolSummary"
import { ReprocessProtocolButton } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ReprocessProtocolButton"
import { ReprocessProtocolEditForm } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ReprocessProtocolEditForm"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { useEffect, useState } from "react"

export type ReprocessedProtocol = {
  title?: string
  body?: string
  date: Date
  subsectionId?: number
  protocolTopics?: number[]
}

type Props = {
  protocol: Awaited<ReturnType<typeof getProtocol>>
  protocolId: number
}

export const ProtocolDetailClient = ({ protocol, protocolId }: Props) => {
  const [aiSuggestions, setAiSuggestions] = useState<ReprocessedProtocol | null>(null)

  const handleAiSuggestions = (suggestions: ReprocessedProtocol) => {
    setAiSuggestions(suggestions)
  }

  const handleCancelAiSuggestions = () => {
    setAiSuggestions(null)
  }

  // Scroll to AI form when suggestions are loaded
  useEffect(() => {
    if (aiSuggestions) {
      const element = document.getElementById("ai-suggestions-form")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [aiSuggestions])

  return (
    <>
      {aiSuggestions ? (
        // Split view: Protocol view on left, AI suggestions form on right
        <div id="ai-suggestions-form" className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-medium">Aktuelles Protokoll</h2>
            <ProtocolSummary protocol={protocol} />
          </div>

          <div>
            <IfUserCanEdit>
              <ReprocessProtocolEditForm
                protocol={protocol}
                aiSuggestions={aiSuggestions}
                onCancel={handleCancelAiSuggestions}
              />
            </IfUserCanEdit>
          </div>
        </div>
      ) : (
        // Normal view
        <>
          <div className="mt-6">
            <IfUserCanEdit>
              <ReprocessProtocolButton
                protocolId={protocolId}
                onAiSuggestions={handleAiSuggestions}
              />
            </IfUserCanEdit>
          </div>

          <ProtocolSummary protocol={protocol} />
        </>
      )}
    </>
  )
}
