import { createFileRoute } from "@tanstack/react-router"
import { PageAdmin } from "@/src/components/pages/admin/PageAdmin"
import { adminTitleHead } from "@/src/routeHead"

export const Route = createFileRoute("/admin/")({
  head: () => adminTitleHead("Dashboard"),
  ssr: true,
  component: PageAdmin,
})
