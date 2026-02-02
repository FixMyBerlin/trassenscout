import { clsx } from "clsx"
import React from "react"

const placementClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-0.5 mb-0.5",
  bottom: "top-full left-1/2 -translate-x-1/2 translate-y-0.5 mt-0.5",
  left: "right-full top-1/2 -translate-y-1/2 -translate-x-0.5 mr-0.5",
  right: "left-full top-1/2 -translate-y-1/2 translate-x-0.5 ml-0.5",
} as const

type Placement = keyof typeof placementClasses

type Props = {
  content: string | null | undefined
  placement?: Placement
  children: React.ReactElement
}

export const Tooltip = ({ content, placement = "top", children }: Props) => {
  if (content === undefined || content === null || content === "") {
    return <>{children}</>
  }
  const child = React.Children.only(children)
  const trigger = React.cloneElement(child, {
    className: clsx("peer", child.props.className),
    title: content,
  })
  return (
    <span className="relative inline-flex">
      {trigger}
      <span
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute z-50 w-max max-w-[200px] rounded bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100",
          placementClasses[placement],
        )}
      >
        {content}
      </span>
    </span>
  )
}
