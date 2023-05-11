import { resolver } from "@blitzjs/rpc"
import { Position } from "@turf/helpers"
import { NotFoundError } from "blitz"
import db, { Subsubsection } from "db"
import { z } from "zod"

const GetSubsubsection = z.object({
  slug: z.string(),
})

// We lie with TypeScript here, because we know better. All `geometry` fields are Position. We make sure of that in our Form. They are also required, so never empty.
// TODO Enhance the types here to include the comming type: area|route with geometry:Position(AKA Point)|Position[](Line)
export type SubsubsectionWithPosition = Omit<Subsubsection, "geometry"> & {
  geometry: [number, number][] // Position[]
}

export default resolver.pipe(
  resolver.zod(GetSubsubsection),
  resolver.authorize(),
  async ({ slug }) => {
    const subsubsection = await db.subsubsection.findFirst({ where: { slug } })

    if (!subsubsection) throw new NotFoundError()

    return subsubsection as SubsubsectionWithPosition // Tip: Validate type shape with `satisfies`
  }
)
