"use client"

import * as ProgressPrimitive from "@radix-ui/react-progress"
import { twMerge } from "tailwind-merge"

export const Progress = ({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) => {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={twMerge(
        "relative h-2 w-full overflow-hidden rounded-full bg-blue-500/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-blue-500 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
