import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/projects/$projectSlug")({
  component: () => <Outlet />,
})
