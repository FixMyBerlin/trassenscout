import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import { deleteSubsubsectionMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  mcpDraftsGroupedQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"

export function PageAdminMcpDrafts() {
  const queryClient = useQueryClient()
  const discardMutation = useMutation({ mutationFn: deleteSubsubsectionMcpDraftFn })
  const { data } = useSuspenseQuery(mcpDraftsGroupedQueryOptions())

  return (
    <>
      <AdminPageHeader title="MCP-Drafts" />
      <div className={pageContentPaddingClassName}>
        {data.total === 0 ? (
          <p className="text-gray-600">Keine offenen MCP-Drafts.</p>
        ) : (
          <div className="space-y-8">
            {data.groups.map((group) => (
              <section key={group.projectSlug}>
                <h2 className="text-lg font-semibold text-gray-900">
                  {shortTitle(group.projectSlug)}
                  {group.projectSubTitle ? (
                    <span className="ml-2 font-normal text-gray-500">{group.projectSubTitle}</span>
                  ) : null}
                </h2>
                <ul className="mt-2 list-none space-y-2 pl-0">
                  {group.drafts.map((draft) => {
                    const createdByLabel = getFullname(draft.createdBy) ?? draft.createdBy.email
                    const when = formatBerlinTime(draft.updatedAt, "dd.MM.yyyy HH:mm")
                    const { subsectionSlug, subsubsectionSlug } = draft

                    return (
                      <li key={draft.id} className="text-sm">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          {subsectionSlug && subsubsectionSlug && draft.kind === "create" ? (
                            <Link
                              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new"
                              params={{
                                projectSlug: group.projectSlug,
                                subsectionSlug,
                              }}
                              search={{ mcpDraft: "true", slug: subsubsectionSlug }}
                            >
                              Neu: {shortTitle(subsubsectionSlug)}
                            </Link>
                          ) : subsectionSlug && subsubsectionSlug ? (
                            <Link
                              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/edit"
                              params={{
                                projectSlug: group.projectSlug,
                                subsectionSlug,
                                subsubsectionSlug,
                              }}
                              search={{ mcpDraft: "true" }}
                            >
                              Update: {shortTitle(subsubsectionSlug)}
                            </Link>
                          ) : (
                            <span className="text-gray-500">Maßnahme nicht gefunden</span>
                          )}
                          <span className="text-gray-500">
                            {subsectionSlug ? ` · ${shortTitle(subsectionSlug)}` : null}
                            {` · ${when} · ${createdByLabel}`}
                          </span>
                          <button
                            type="button"
                            className="cursor-pointer text-purple-800 underline underline-offset-2"
                            disabled={discardMutation.isPending}
                            onClick={() => {
                              void (async () => {
                                await discardMutation.mutateAsync({
                                  data: { projectSlug: group.projectSlug, id: draft.id },
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
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
