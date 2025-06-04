type Props = {
  data: any
}

export const DebugData = ({ data }: Props) => {
  return (
    <details>
      <summary className="cursor-pointer underline-offset-2 hover:underline">Rohdaten…</summary>
      <pre className="text-xs">{JSON.stringify(data, undefined, 2)}</pre>
    </details>
  )
}
