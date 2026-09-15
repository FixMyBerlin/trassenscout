type Props = {
  label: string
  help?: React.ReactNode
  children: React.ReactNode
}

export const FormElementWrapper = ({ label, help, children }: Props) => {
  return (
    <div>
      <p className={help ? "font-semibold" : "mb-3 font-semibold"}>{label}</p>
      {Boolean(help) && <p className="mt-1 mb-3 text-sm text-gray-500">{help}</p>}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}
