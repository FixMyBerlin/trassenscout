import type { ReactNode } from "react"
import { linkStyles } from "@/src/components/core/components/links/styles"

type Props = {
  children: ReactNode
  onShowList?: () => void
}

export const SubsubsectionSearchMapNotice = ({ children, onShowList }: Props) => {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-10 flex justify-center px-4 lg:top-3">
      <p
        role="status"
        className="pointer-events-auto flex items-center gap-3 rounded-md bg-white px-3 py-2 text-sm text-gray-700 shadow-md"
      >
        <span>{children}</span>
        {onShowList ? (
          <button type="button" className={linkStyles} onClick={onShowList}>
            In der Liste ansehen
          </button>
        ) : null}
      </p>
    </div>
  )
}
