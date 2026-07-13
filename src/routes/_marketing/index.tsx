import { createFileRoute } from "@tanstack/react-router"
import { PageMarketing } from "@/src/components/pages/PageMarketing"

export const Route = createFileRoute("/_marketing/")({
  ssr: true,
  component: PageMarketing,
})
