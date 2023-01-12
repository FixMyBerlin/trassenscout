import { RouteUrlObject } from "blitz"
import { ReactNode } from "react"

export type PrimaryNavigation = {
  name: string
  href: RouteUrlObject | string
  children?: { name: string; href: RouteUrlObject }[]
}

export type SecondaryNavigation = {
  name: string
  href: RouteUrlObject | string
}

export type PrimaryNavigationProps = {
  primaryNavigation: PrimaryNavigation[]
  //secondaryNavigation: SecondaryNavigation[][]
}
