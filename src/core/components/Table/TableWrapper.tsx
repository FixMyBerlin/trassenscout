import { clsx } from "clsx"
import { ReactNode } from "react"

type Props = {
  className?: string
  children: ReactNode
}

export const TableWrapper = ({ className, children }: Props) => {
  return (
    <div className={clsx(className, "-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8")}>
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="not-prose overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
