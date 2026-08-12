import { twJoin } from "tailwind-merge"

type Props = {
  className?: string
}

/** Horizontal rule between Headless UI menu sections (same pattern as Headless UI docs). */
export const NavigationMenuSeparator = ({ className }: Props) => {
  return <div role="separator" className={twJoin("my-1 h-px bg-gray-200", className)} />
}
