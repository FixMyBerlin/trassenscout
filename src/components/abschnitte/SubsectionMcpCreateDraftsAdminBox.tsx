import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale/de"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { Link } from "@/src/components/core/components/links/Link"
import { getFullname } from "@/src/components/core/users/getFullname"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { deleteMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  subsectionMcpCreateDraftsQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

type Props = {
  projectSlug: string
  subsectionSlug: string
  className?: string
}

export function SubsectionMcpCreateDraftsAdminBox({
  projectSlug,
  subsectionSlug,
  className,
}: Props) {
  const queryClient = useQueryClient()
  const { data: user } = useQuery(currentUserQueryOptions())
  const draftsQuery = useQuery({
    ...subsectionMcpCreateDraftsQueryOptions({ projectSlug, subsectionSlug }),
    enabled: user?.role === UserRoleEnum.ADMIN,
  })
  const discardMutation = useMutation({ mutationFn: deleteMcpDraftFn })

  const drafts = draftsQuery.data?.drafts ?? []
  if (drafts.length === 0) return null

  return (
    <SuperAdminBox className={className}>
      <p className="font-semibold">MCP-Vorschläge (neu)</p>
      <ul className="mt-2 list-none space-y-3 pl-0">
        {drafts.map((draft) => {
          const createdByLabel = getFullname(draft.createdBy) ?? draft.createdBy.email
          const ageLabel = formatDistanceToNow(draft.updatedAt, { addSuffix: true, locale: de })
          const slug = draft.slug ?? ""
          return (
            <li key={draft.id} className="text-sm">
              <p>
                <span className="font-medium">{slug || "ohne Kürzel"}</span>
                {` · ${createdByLabel}, ${ageLabel}`}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {slug ? (
                  <Link
                    button="blue"
                    buttonSize="sm"
                    to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new"
                    params={{ projectSlug, subsectionSlug }}
                    search={{ mcpDraft: "true", slug }}
                  >
                    Formular öffnen und Werte einsetzen
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="cursor-pointer text-purple-800 underline underline-offset-2"
                  disabled={discardMutation.isPending}
                  onClick={() => {
                    void (async () => {
                      await discardMutation.mutateAsync({
                        data: { projectSlug, id: draft.id },
                      })
                      await invalidateMcpDraftQueries(queryClient)
                    })()
                  }}
                >
                  Verwerfen
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </SuperAdminBox>
  )
}
