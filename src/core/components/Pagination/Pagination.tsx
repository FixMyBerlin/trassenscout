import React from "react"
import { buttonStyles } from "../links"

type Props = {
  hasMore: boolean
  page: number
  handlePrev: () => void
  handleNext: () => void
}

export const Pagination: React.FC<Props> = ({ hasMore, page, handlePrev, handleNext }) => {
  if (!hasMore || page !== 0) return null

  return (
    <div className="space-x-3">
      <button className={buttonStyles} disabled={page === 0} onClick={handlePrev}>
        ←
      </button>
      <button className={buttonStyles} disabled={!hasMore} onClick={handleNext}>
        →
      </button>
    </div>
  )
}
