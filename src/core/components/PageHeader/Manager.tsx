import { CurrentUser } from "src/users/types"
import { getFullname } from "src/users/utils"

type Props = {
  manager: CurrentUser
}
export const Manager: React.FC<Props> = ({ manager }) => {
  if (!manager) return null

  return (
    <p className="mt-5">
      <strong>Koordination:</strong> {getFullname(manager)}
    </p>
  )
}
