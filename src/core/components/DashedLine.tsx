import React from "react"

export const DashedLine = () => {
  return (
    <div
      className="mt-6 h-[1px]"
      style={{
        background:
          "repeating-linear-gradient(to right, #8EB2E1, #8EB2E1 10px, transparent 10px, transparent 13px)",
      }}
    />
  )
}
