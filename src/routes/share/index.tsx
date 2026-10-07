import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/share/")({
  ssr: true,
  loader: () => {
    throw notFound()
  },
})
