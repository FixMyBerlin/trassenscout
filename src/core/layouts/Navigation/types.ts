import { RouteUrlObject } from "blitz"

export type MenuItems = { menuItems: MenuItem[] }

type MenuItem = {
  name: string
  href: RouteUrlObject
  children?: { name: string; href: RouteUrlObject }[]
}
