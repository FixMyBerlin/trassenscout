type Props =
  | {
      firstName?: string | null
      lastName?: string | null
    }
  | null
  | undefined

export const getFullname = (user: Props) => {
  if (!user) return null

  const fullname = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")

  return fullname || null
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

  const institution = user?.institution?.trim()
  return institution ? `${fullname} (${institution})` : fullname
}
