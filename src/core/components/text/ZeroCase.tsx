type Props = { visible: boolean | number; name?: string; small?: boolean }

export const ZeroCase: React.FC<Props> = ({ visible, name, small }) => {
  if (typeof visible === "number" && !!visible) return null
  if (typeof visible !== "number" && !visible) return null

  if (small) {
    return (
      <p className="my-4 text-base text-gray-500">
        Es wurden noch {name ? `keine ${name}` : "nichts"} eingetragen.
      </p>
    )
  }

  return (
    <div className="relative my-10 flex items-center justify-center text-xl text-gray-500">
      <div className="absolute inset-x-0 h-px bg-gray-200" />
      <p className="relative inline-block bg-white px-4">
        Es wurden noch {name ? `keine ${name}` : "nichts"} eingetragen.
      </p>
    </div>
  )
}
