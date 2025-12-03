import { linkStyles } from "@/src/core/components/links/styles"
import { clsx } from "clsx"

type Props = { data: Object; open?: true; className?: string }

export const ObjectDump = ({ data, open, className }: Props) => {
  return (
    <details open={open} className={clsx(className, "prose-sm")}>
      <summary className={clsx(linkStyles, "cursor-pointer whitespace-nowrap")}>JSON Dump</summary>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </details>
  )
}
