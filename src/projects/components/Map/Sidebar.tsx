import React from "react"

type Props = {
  className?: string | undefined
  subsubsection: any
  onClose: () => void
}

export const Sidebar: React.FC<Props> = ({ className, subsubsection, onClose }) => {
  return (
    <div className={className}>
      <button className="absolute right-2 top-2 border-2 border-black p-1" onClick={onClose}>
        <b>close</b>
      </button>
      <code>
        <pre>{JSON.stringify(subsubsection, null, 2)}</pre>
      </code>
    </div>
  )
}
