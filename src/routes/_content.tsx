import { createFileRoute } from "@tanstack/react-router"
import { LayoutContent } from "@/src/components/shared/layouts/LayoutContent"
import { optionalCurrentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export const Route = createFileRoute("/_content")({
  ssr: true,
  loader: ({ context }) => context.queryClient.ensureQueryData(optionalCurrentUserQueryOptions()),
  component: LayoutContent,
})
