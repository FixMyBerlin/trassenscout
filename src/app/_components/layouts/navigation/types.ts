import { Route } from "next"

export type MenuItem = {
  name: string
  href: Route
  alsoHighlightPathnames?: Route[]
  children?: { name: string; href: Route; slug: string }[]
}
