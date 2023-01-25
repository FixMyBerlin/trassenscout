import { CurrentUser } from "src/users/types"

type Props = {
  manager: CurrentUser
}
export const Manager: React.FC<Props> = ({ manager }) => {
  if (!manager) return null

  return (
    <p className="mt-5">
      <strong>Koordination:</strong> {manager?.firstName && manager?.firstName} {manager?.lastName}
    </p>
  )
}
