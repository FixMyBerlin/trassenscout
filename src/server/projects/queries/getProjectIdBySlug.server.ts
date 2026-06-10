import db from "@/src/server/db.server"
import { AuthorizationError } from "@/src/shared/auth/errors"

type Input = string | Record<string, any> | undefined | null

export const getProjectIdBySlug = async (input: Input) => {
  if (!input) {
    throw new AuthorizationError()
  }

  let projectSlug: null | string = null

  if (typeof input === "string") {
    projectSlug = input
  } else if ("projectSlug" in input) {
    projectSlug = input.projectSlug
  } else if ("slug" in input) {
    projectSlug = input.slug
  }

  if (projectSlug === null) {
    throw new AuthorizationError()
  }

  const project = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })

  return project.id
}
