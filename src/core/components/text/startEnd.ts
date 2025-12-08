type Props = { start: string; end: string }

export const startEnd = ({ start, end }: Props) => {
  return `${start} ▸ ${end}`
}
