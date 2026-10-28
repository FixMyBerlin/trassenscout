import { createFileRoute } from "@tanstack/react-router"
import { PageProjectRecordsInbox } from "@/src/components/pages/project-records/PageProjectRecordsInbox"
import { assertProjectRecordInboxAccess } from "@/src/components/project-records/inbox/assertProjectRecordInboxAccess"
import { privateTitleHead } from "@/src/routeHead"
import { endpointAuth } from "@/src/server/auth/endpointAuthBoundary"
import { projectRecordEmailInboxQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailInboxQueryOptions"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/project-records/inbox/")({
  head: () => privateTitleHead("Posteingang - Projektprotokoll"),
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
      projectRecordEmailInboxQueryOptions({ projectSlug: params.projectSlug }),
    ),
  component: PageProjectRecordsInbox,
})
