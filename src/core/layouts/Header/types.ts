import { RouteUrlObject } from "blitz"
import { ReactNode } from "react"

export type MenuItems = { menuItems: MenuItem[] }

type MenuItem = {
  name: string
  href: RouteUrlObject
  children?: { name: string; href: RouteUrlObject }[]
}
