import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecordInboxEmail } from "@/src/components/pages/project-records/PageProjectRecordInboxEmail"
import { assertProjectRecordInboxAccess } from "@/src/components/project-records/inbox/assertProjectRecordInboxAccess"
import { privateTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { projectRecordEmailInboxItemQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailInboxQueryOptions"

export const Route = createFileRoute(
  "/_loggedInProjects/$projectSlug/project-records/inbox/$projectRecordEmailId/",
)({
  head: () => privateTitleHead("E-Mail im Posteingang - Projektprotokoll"),
  ssr: true,
  beforeLoad: async ({ context, params }) => {
    endpointAuth.inherited("auth enforced by _loggedInProjects layout")
    await assertProjectRecordInboxAccess({
      queryClient: context.queryClient,
      membershipRole: context.membershipRole,
      projectSlug: params.projectSlug,
    })
  },
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      projectRecordEmailInboxItemQueryOptions({
        projectSlug: params.projectSlug,
        projectRecordEmailId: Number(params.projectRecordEmailId),
      }),
    ),
  component: PageProjectRecordInboxEmail,
})
