import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { H2 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { quote } from "@/src/core/components/text/quote"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import getStakeholdernotes from "@/src/server/stakeholdernotes/queries/getStakeholdernotes"
import { Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import StakeholdernoteList from "./StakeholderSectionList"
import { StakeholdernoteFilterDropdown } from "./StakeholdernoteFilterDropdown"
import { stakeholderNoteLabel } from "./stakeholdernotesStatus"

type Props = {
  subsectionId: number
}

export const hashStakeholdernotes = "stakeholdernotes"

export const StakeholderSection: React.FC<Props> = ({ subsectionId }) => {
  const params = useRouterQuery()
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, { projectSlug, subsectionId })

  const filteredStakeholdernotes = params.stakeholderFilter
    ? stakeholdernotes.filter((s) => s.status === params.stakeholderFilter)
    : stakeholdernotes

  const statusLabel = stakeholderNoteLabel(params.stakeholderFilter)

  return (
    <section className="mt-12" id={hashStakeholdernotes}>
      <HeadingWithAction className="mb-5">
        <H2>
          Abstimmung mit <abbr title="Träger öffentlicher Belange"> TÖB</abbr>s
          {statusLabel && ` – Status ${quote(statusLabel)}`}
        </H2>
        <StakeholdernoteFilterDropdown stakeholdernotes={stakeholdernotes} />
      </HeadingWithAction>

      <ZeroCase
        visible={filteredStakeholdernotes.length}
        name={statusLabel ? "TÖBs für den gewählten Filter" : "TÖBs"}
      />

      <StakeholdernoteList stakeholdernotes={filteredStakeholdernotes} />

      <IfUserCanEdit>
        <ButtonWrapper className="mt-5">
          <Link
            button="blue"
            icon="plus"
            href={Routes.NewStakeholdernotesPage({
              projectSlug,
              subsectionSlug: subsectionSlug!,
            })}
          >
            TÖB hinzufügen
          </Link>
        </ButtonWrapper>
      </IfUserCanEdit>
    </section>
  )
}
