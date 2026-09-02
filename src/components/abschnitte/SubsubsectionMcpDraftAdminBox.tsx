import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { getFullname } from "@/src/components/core/users/getFullname"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { deleteSubsubsectionMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  subsubsectionMcpDraftQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

type Props = {
  projectSlug: string
  subsectionSlug: string
  subsubsectionSlug: string
  subsubsectionId: number
  overlayApplied?: boolean
  className?: string
}

export function SubsubsectionMcpDraftAdminBox({
  projectSlug,
  subsectionSlug,
  subsubsectionSlug,
  subsubsectionId,
  overlayApplied = false,
  className,
}: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useQuery(currentUserQueryOptions())
  const draftQuery = useQuery({
    ...subsubsectionMcpDraftQueryOptions({ projectSlug, subsectionSlug, subsubsectionSlug }),
    enabled: user?.role === UserRoleEnum.ADMIN,
  })
  const discardMutation = useMutation({ mutationFn: deleteSubsubsectionMcpDraftFn })

  const draft = draftQuery.data
  if (!draft) return null

  const createdByLabel = getFullname(draft.createdBy) ?? draft.createdBy.email
  const ageLabel = formatDistanceToNow(draft.updatedAt, { addSuffix: true, locale: de })

  const handleDiscard = async () => {
    await discardMutation.mutateAsync({
      data: { projectSlug, subsubsectionId },
    })
    await invalidateMcpDraftQueries(queryClient)
    if (overlayApplied) {
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit",
        params: { projectSlug, subsectionSlug, subsubsectionSlug },
        search: {},
      })
    }
  }

  return (
    <SuperAdminBox className={className}>
      <p className="font-semibold">MCP-Vorschlag</p>
      <p>
        Von {createdByLabel}, {ageLabel}.
      </p>
      <pre className="max-h-64 overflow-auto rounded bg-white/80 p-2 font-mono text-[11px] leading-snug whitespace-pre-wrap text-gray-800">
        {JSON.stringify(draft.patch, null, 2)}
      </pre>
      {overlayApplied ? (
        <p>MCP-Werte im Formular — Speichern übernimmt, Verwerfen löscht den Vorschlag.</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {overlayApplied ? null : (
          <Link
            button="blue"
            buttonSize="sm"
            to={`/${projectSlug}/abschnitte/${subsectionSlug}/fuehrung/${subsubsectionSlug}/edit?mcpDraft=true`}
          >
            Einsetzen
          </Link>
        )}
        <button
          type="button"
          className="cursor-pointer text-purple-800 underline underline-offset-2"
          disabled={discardMutation.isPending}
          onClick={() => {
            void handleDiscard()
          }}
        >
          Verwerfen
        </button>
      </div>
    </SuperAdminBox>
  )
}
