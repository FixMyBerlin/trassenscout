export const formattedEmailAddress = (props: string | { Name?: string; Email: string }) => {
  if (typeof props === "string") return props
  if (!props.Name) return props.Email

  return `"${props.Name}" <${props.Email}>`
}
