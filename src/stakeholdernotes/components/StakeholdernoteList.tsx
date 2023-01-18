import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Link } from "src/core/components/links"
import getStakeholdernotes from "src/stakeholdernotes/queries/getStakeholdernotes"

export const StakeholdernotesList = () => {
  const router = useRouter()
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, {
    orderBy: { id: "asc" },
  })

  return (
    <>
      <p>
        <Link href={Routes.NewStakeholdernotePage()}>Stakeholdernote erstellen</Link>
      </p>

      <ul>
        {stakeholdernotes.map((stakeholdernote) => (
          <li key={stakeholdernote.id}>
            <Link href={Routes.ShowStakeholdernotePage({ stakeholdernoteId: stakeholdernote.id })}>
              {stakeholdernote.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default StakeholdernotesList
