import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"
import type { RouteUrlObject } from "blitz"
import { z } from "zod"

const QuerySchema = z.record(z.string().transform((val) => String(val)))

export const mailUrl = (input: RouteUrlObject) => {
  const origin = getPrdOrStgDomain()
  const url = new URL(input.href, origin)

  // The type for input.query includes `ParsedUrlQueryInput` which can be all kind of stuff
  // Our rule here is, to only allow Record<string, string>.
  const query = QuerySchema.parse(input.query)
  const params = new URLSearchParams(query)

  params.forEach((value, key) => {
    // The params that are used to replace the URL template are still present.
    // We need to filter them here.
    // Otherwise we get URLs like `https://staging.trassenscout.de/rs23/invites?projectSlug=rs23`
    if (input.pathname.includes(key)) return

    url.searchParams.append(key, value)
  })

  return url.toString()
}
