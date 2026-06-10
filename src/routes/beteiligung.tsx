import { createFileRoute } from "@tanstack/react-router"
import { LayoutOutlet } from "@/src/components/shared/layouts/LayoutOutlet"

export const Route = createFileRoute("/beteiligung")({
  ssr: true,
  component: LayoutOutlet,
})
