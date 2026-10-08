import { createFileRoute, notFound } from "@tanstack/react-router"
import { PagePublicExternalShare } from "@/src/components/pages/externalShare/PagePublicExternalShare"
import { getPublicExternalShareFn } from "@/src/server/externalShare/publicExternalShare.functions"

export const Route = createFileRoute("/share/$token")({
  ssr: true,
  loader: async ({ params }) => {
    try {
      return await getPublicExternalShareFn({ data: { token: params.token } })
    } catch (error) {
      if (error instanceof Error && error.name === "NotFoundError") throw notFound()
      throw error
    }
  },
  component: PagePublicExternalShare,
})
