import { AdminSearchField } from "@/src/components/admin/AdminSearchField"

type Props = {
  userValue: string
  projectValue: string
  onUserChange: (value: string) => void
  onProjectChange: (value: string) => void
}

export function MembershipsSearchBar({
  userValue,
  projectValue,
  onUserChange,
  onProjectChange,
}: Props) {
  return (
    <form
      id="memberships-filter"
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => event.preventDefault()}
    >
      <AdminSearchField
        name="user"
        value={userValue}
        ariaLabel="Nutzer filtern"
        placeholder="Nutzer"
        onChange={onUserChange}
      />
      <AdminSearchField
        name="project"
        value={projectValue}
        ariaLabel="Projekt filtern"
        placeholder="Projekt-Slug"
        onChange={onProjectChange}
      />
    </form>
  )
}
