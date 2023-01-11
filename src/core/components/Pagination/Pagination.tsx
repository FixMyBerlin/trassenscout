import React from "react"
import { buttonStyles } from "../links"

type Props = {
  visible: boolean
  disablePrev: boolean
  disableNext: boolean
  handlePrev: () => void
  handleNext: () => void
}

export const Pagination: React.FC<Props> = ({
  visible,
  disablePrev,
  disableNext,
  handlePrev,
  handleNext,
}) => {
  if (visible) return null

  return (
    <div className="space-x-3">
      <button className={buttonStyles} disabled={disablePrev} onClick={handlePrev}>
        ←
      </button>
      <button className={buttonStyles} disabled={disableNext} onClick={handleNext}>
        →
      </button>
    </div>
  )
}
