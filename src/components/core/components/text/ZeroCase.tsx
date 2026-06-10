import { clsx } from "clsx"

type Props = {
  visible: boolean | number
  name?: string
  small?: boolean
  text?: string
  /** Background behind the label where it crosses the divider line. */
  textBackgroundClassName?: string
}

export const ZeroCase = ({
  visible,
  name,
  small,
  text,
  textBackgroundClassName = "bg-inherit",
}: Props) => {
  if (typeof visible === "number" && !!visible) return null
  if (typeof visible !== "number" && !visible) return null

  const content = text ?? `Es wurden noch ${name ? `keine ${name}` : "nichts"} eingetragen.`

  if (small) {
    return <p className="my-4 text-base text-gray-500">{content}</p>
  }

  return (
    <div
      className={clsx(
        "relative my-10 flex items-center justify-center text-xl text-gray-500",
        textBackgroundClassName,
      )}
    >
      <div className="absolute inset-x-0 h-px bg-gray-200" />
      <p className={clsx("relative inline-block px-4", textBackgroundClassName)}>{content}</p>
    </div>
  )
}
