import { twJoin, twMerge } from "tailwind-merge"

type RowSlots = { left?: React.ReactNode; right?: React.ReactNode }

type Props = {
  row1?: RowSlots
  row2?: RowSlots
  row3?: RowSlots
  row4?: RowSlots
  className?: string
}

const rowClassName = "flex h-12 items-center justify-between gap-4 border-b border-gray-200 px-4"

function hasRowContent({ left, right }: RowSlots) {
  return Boolean(left || right)
}

function PageHeaderRow({ left, right, className }: RowSlots & { className?: string }) {
  if (!hasRowContent({ left, right })) return null

  return (
    <div className={className}>
      <div className="min-w-0 flex-1">{left}</div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

export function PageHeaderLayout({ row1, row2, row3, row4, className }: Props) {
  const hasRow1 = row1 && hasRowContent(row1)
  const hasRow2 = row2 && hasRowContent(row2)
  const hasRow3 = row3 && hasRowContent(row3)
  const hasRow4 = row4 && hasRowContent(row4)

  if (!hasRow1 && !hasRow2 && !hasRow3 && !hasRow4) return null

  return (
    <header className={twMerge("w-full", className)}>
      {hasRow1 ? (
        <PageHeaderRow
          left={row1.left}
          right={row1.right}
          className={twJoin(rowClassName, "bg-gray-50")}
        />
      ) : null}

      {hasRow2 ? (
        <PageHeaderRow
          left={row2.left}
          right={row2.right}
          className={twJoin(rowClassName, "bg-white")}
        />
      ) : null}

      {hasRow3 ? (
        <PageHeaderRow
          left={row3.left}
          right={row3.right}
          className={twJoin(rowClassName, "bg-white")}
        />
      ) : null}

      {hasRow4 ? (
        <PageHeaderRow
          left={row4.left}
          right={row4.right}
          className={twJoin(
            "flex min-h-12 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2",
          )}
        />
      ) : null}
    </header>
  )
}
