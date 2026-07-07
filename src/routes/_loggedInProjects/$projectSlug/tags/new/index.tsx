import { createFileRoute } from "@tanstack/react-router"
import { seoNewTitle } from "@/src/components/core/components/text/titles"
import { PageTagsNew } from "@/src/components/pages/tags/PageTagsNew"
import { absoluteTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/tags/new/")({
  head: () => absoluteTitleHead(seoNewTitle("Tag")),
  ssr: true,
  component: PageTagsNew,
})
