import db from "db"
import { AuthorizationError } from "blitz"

type Input = string | Record<string, any>

const getProjectIdBySlug = async (input: Input) => {
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

export default getProjectIdBySlug
