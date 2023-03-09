import db from "db"
import { AuthorizationError } from "blitz"

type Input = string | Record<string, any>

const getProjectIdBySlug = async (input: Input): Promise<number> => {
  let projectSlug
  if (typeof input === "string") {
    projectSlug = input
  } else if ("projectSlug" in input) {
    projectSlug = input.projectSlug
  } else if ("slug" in input) {
    projectSlug = input.slug
  } else {
    throw new AuthorizationError()
  }
  return (
    await db.project.findFirstOrThrow({
      // @ts-ignore possible error is intended here
      where: { slug: projectSlug || null },
      select: { id: true },
    })
  ).id
}

export default getProjectIdBySlug
