type Props = {
  firstName?: string | null
  lastName?: string | null
} | null

export const getFullname = (user: Props) => {
  if (!user) return null

  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}

type PropsWithInstitution =
  | {
      firstName?: string | null
      lastName?: string | null
      institution?: string | null
    }
  | null
  | undefined

export const getFullnameWithInstitution = (user: PropsWithInstitution) => {
  const fullname = getFullname(user ?? null)
  if (!fullname) return null

  return user?.institution ? `${fullname} (${user.institution})` : fullname
}
