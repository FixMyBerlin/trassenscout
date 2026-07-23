import { twMerge } from "tailwind-merge"
import { pillShellClasses } from "@/src/components/core/utils/pillClassNames"

const adminBadgeBase = twMerge(pillShellClasses, "text-xs/3.5 ring-1 ring-inset")

const adminBadgeVariants = {
  gray: "bg-gray-50 text-gray-600 ring-gray-500/10",
  red: "bg-red-50 text-red-700 ring-red-600/10",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-700/10",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-700/10",
  purple: "bg-purple-50 text-purple-700 ring-purple-700/10",
  pink: "bg-pink-50 text-pink-700 ring-pink-700/10",
} as const

export type AdminBadgeVariant = keyof typeof adminBadgeVariants

type Props = {
  children: React.ReactNode
  variant?: AdminBadgeVariant
  className?: string
}

export const AdminBadge = ({ children, variant = "gray", className }: Props) => (
  <span className={twMerge(adminBadgeBase, adminBadgeVariants[variant], className)}>
    {children}
  </span>
)
