type Props = {
  firstName?: string | null
  lastName?: string | null
} | null

export const getFullname = (user: Props) => {
  if (!user) return null

  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}
