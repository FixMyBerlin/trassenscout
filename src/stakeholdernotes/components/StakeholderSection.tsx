import { Routes } from "@blitzjs/next"
import React from "react"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import StakeholdernoteList from "./StakeholderSectionList"
import { H2 } from "src/core/components/text/Headings"
import { Stakeholdernote } from "@prisma/client"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"

type Props = {
  stakeholdernotes: Stakeholdernote[]
}

export const StakeholderSection: React.FC<Props> = ({ stakeholdernotes }) => {
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()

  return (
    <section className="mt-12">
      <H2 className="mb-5">
        Abstimmung mit <abbr title="Träger öffentlicher Belange">TöB</abbr>s
      </H2>
      <StakeholdernoteList stakeholdernotes={stakeholdernotes} />
      <ButtonWrapper className="mt-5">
        <Link
          button="blue"
          icon="plus"
          href={Routes.NewStakeholdernotePage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          TöB
        </Link>
        <Link
          button="white"
          icon="plus"
          href={Routes.NewStakeholdernoteMultiPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          Mehrere TöBs
        </Link>
      </ButtonWrapper>
    </section>
  )
}
