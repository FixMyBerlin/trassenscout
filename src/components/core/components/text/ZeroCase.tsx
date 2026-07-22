import { twJoin } from "tailwind-merge"
import { metadataItemClassName } from "@/src/components/project-records/ProjectRecordSummary"

type Props = {
  visible: boolean | number
  name?: string
  small?: boolean
  text?: string
  verb?: string
}

export const ZeroCase = ({ visible, name, small, text, verb = "eingetragen" }: Props) => {
  if (typeof visible === "number" && !!visible) return null
  if (typeof visible !== "number" && !visible) return null

  const content = text ?? `Es wurden noch ${name ? `keine ${name}` : "nichts"} ${verb}.`

  if (small) {
    return <p className={metadataItemClassName}>{content}</p>
  }

  return (
    <div
      className={twJoin("relative my-10 flex items-center justify-center text-xl text-gray-500")}
    >
      <div className="absolute inset-x-0 h-px bg-gray-200" />
      <p className={twJoin("relative inline-block bg-white px-4")}>{content}</p>
    </div>
  )
}
