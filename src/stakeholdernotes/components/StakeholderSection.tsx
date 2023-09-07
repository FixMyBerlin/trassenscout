import { Routes, useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import React from "react"
import { Link } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { quote } from "src/core/components/text"
import { H2 } from "src/core/components/text/Headings"
import { ZeroCase } from "src/core/components/text/ZeroCase"
import { useSlugs } from "src/core/hooks"
import getStakeholdernotes from "../queries/getStakeholdernotes"
import StakeholdernoteList from "./StakeholderSectionList"
import { StakeholdernoteFilterDropdown } from "./StakeholdernoteFilterDropdown"
import { stakeholderNoteLabel } from "./stakeholdernotesStatus"

type Props = {
  subsectionId: number
}

export const hashStakeholdernotes = "stakeholdernotes"

export const StakeholderSection: React.FC<Props> = ({ subsectionId }) => {
  const params = useRouterQuery()
  const { projectSlug, subsectionSlug } = useSlugs()
  const [{ stakeholdernotes }] = useQuery(getStakeholdernotes, { subsectionId })

  const filteredStakeholdernotes = params.stakeholderFilter
    ? stakeholdernotes.filter((s) => s.status === params.stakeholderFilter)
    : stakeholdernotes

  const statusLabel = stakeholderNoteLabel(params.stakeholderFilter)

  return (
    <section className="mt-12" id={hashStakeholdernotes}>
      <div className="mb-5 flex items-center justify-between">
        <H2>
          Abstimmung mit <abbr title="Träger öffentlicher Belange"> TÖB</abbr>s
          {statusLabel && ` – Status ${quote(statusLabel)}`}
        </H2>
        <StakeholdernoteFilterDropdown stakeholdernotes={stakeholdernotes} />
      </div>

      <ZeroCase
        visible={filteredStakeholdernotes.length}
        name={statusLabel ? "TÖBs für den gewählten Filter" : "TÖBs"}
      />

      <StakeholdernoteList stakeholdernotes={filteredStakeholdernotes} />
      <ButtonWrapper className="mt-5">
        <Link
          button="blue"
          icon="plus"
          href={Routes.NewStakeholdernotesPage({
            projectSlug: projectSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          TÖB hinzufügen
        </Link>
      </ButtonWrapper>
    </section>
  )
}
