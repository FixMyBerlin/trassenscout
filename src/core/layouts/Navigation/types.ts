import { RouteUrlObject } from "blitz"

export type MenuItem = {
  name: string
  href: RouteUrlObject
  alsoHighlightPathnames?: RouteUrlObject[]
  children?: { name: string; href: RouteUrlObject; slug: string }[]
}
