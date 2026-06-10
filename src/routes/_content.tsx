import { createFileRoute } from "@tanstack/react-router"
import { LayoutContent } from "@/src/components/shared/layouts/LayoutContent"

export const Route = createFileRoute("/_content")({
  ssr: true,
  component: LayoutContent,
})
