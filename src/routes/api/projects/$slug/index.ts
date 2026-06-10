import { createFileRoute } from "@tanstack/react-router"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

export const Route = createFileRoute("/api/projects/$slug/")({
  ssr: false,
  server: {
    handlers: {
      GET: async ({ params }) => {
        endpointAuth.public("project metadata for public map embed")
        const project = await db.project.findUnique({
          where: { slug: params.slug },
          select: {
            aiEnabled: true,
            alkisStateKey: true,
            description: true,
            exportEnabled: true,
            id: true,
            landAcquisitionModuleEnabled: true,
            slug: true,
            subTitle: true,
          },
        })

        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 })
        }

        return Response.json(project)
      },
    },
  },
})
