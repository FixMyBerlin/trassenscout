import React from "react"
import { twJoin } from "tailwind-merge"

const placementClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-0.5 mb-0.5",
  "top-start": "bottom-full left-1/2 -translate-x-[calc(50%+0.5rem)] -translate-y-0.5 mb-0.5",
  bottom: "top-full left-1/2 -translate-x-1/2 translate-y-0.5 mt-0.5",
  "bottom-end": "top-full right-0 translate-y-0.5 mt-0.5",
  left: "right-full top-1/2 -translate-y-1/2 -translate-x-0.5 mr-0.5",
  right: "left-full top-1/2 -translate-y-1/2 translate-x-0.5 ml-0.5",
} as const

type Placement = keyof typeof placementClasses
type Variant = "dark" | "light"

const variantClasses: Record<Variant, string> = {
  dark: "bg-gray-800 text-gray-100",
  light: "bg-white text-gray-900 shadow-xs inset-ring inset-ring-gray-300",
}

type Props = {
  content: string | null | undefined
  placement?: Placement
  variant?: Variant
  children: React.ReactElement<{ className?: string; title?: string }>
}

export const Tooltip = ({ content, placement = "top", variant = "dark", children }: Props) => {
  if (content === undefined || content === null || content === "") {
    return <>{children}</>
  }
  const child = React.Children.only(children)
  const isButtonTrigger = child.type === "button"
  const trigger = React.cloneElement(child, {
    className: twJoin("peer inline-flex", child.props.className),
  })
  return (
    <span className={twJoin("relative inline-flex", isButtonTrigger && "cursor-pointer")}>
      {trigger}
      {/* `hidden` (not `opacity-0`) so idle tooltips don't widen scroll containers like the admin table wrapper */}
      <span
        role="tooltip"
        className={twJoin(
          "pointer-events-none absolute z-50 hidden w-max max-w-[200px] rounded px-2 py-1 text-xs opacity-100 transition-opacity transition-discrete duration-150 peer-hover:block peer-focus-visible:block starting:opacity-0",
          variantClasses[variant],
          placementClasses[placement],
        )}
      >
        {content}
      </span>
    </span>
  )
}
