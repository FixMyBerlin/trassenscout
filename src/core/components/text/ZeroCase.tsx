type Props = { visible: boolean | number; name?: string }

export const ZeroCase: React.FC<Props> = ({ visible, name }) => {
  if (typeof visible === "number" && !!visible) return null
  if (typeof visible !== "number" && !visible) return null

  return (
    <div className="relative flex items-center justify-center text-xl text-gray-300">
      <div className="absolute inset-x-0 h-px bg-gray-200" />
      <p className="relative inline-block bg-white px-4">
        Es wurden noch {name ? `keine ${name}` : "nichts"} eingetragen.
      </p>
    </div>
  )
}
