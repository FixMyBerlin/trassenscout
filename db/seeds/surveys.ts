import db, { Prisma } from "../index"

const seedSurveys = async () => {
  const seedData: Prisma.SurveyUncheckedCreateInput[] = [
    {
      projectId: 1,
      slug: "rs23-1",
      title: "RS23 Beteiligung 1 (inaktiv)",
      active: false,
    },
    {
      projectId: 1,
      slug: "rs23-inaktiv",
      title: "RS23 Beteiliung 2 (aktiv)",
      active: true,
    },
    {
      projectId: 2,
      slug: "ris3000",
      title: "Projekt Mit Einer Umfrage (Redirect)",
      active: false,
    },
    {
      projectId: 1,
      slug: "radnetz-brandenburg",
      title: "Radnetz Brandenburg",
      active: true,
    },
    {
      projectId: 1,
      slug: "frm7",
      title: "FRM7",
      active: true,
    },
    {
      projectId: 1,
      slug: "rs8",
      title: "RS8",
      active: true,
    },
    {
      projectId: 1,
      slug: "rstest-1-2-3",
      title: "RS Test 1-2-3",
      active: true,
    },
    {
      projectId: 1,
      slug: "rstest-2-3",
      title: "RS Test 2-3",
      active: true,
    },
    {
      projectId: 1,
      slug: "rstest-2",
      title: "RS Test 2",
      active: true,
    },
    {
      projectId: 1,
      slug: "rstest-1",
      title: "RS Test 1",
      active: true,
    },
    {
      projectId: 1,
      slug: "ohv-haltestellenfoerderung",
      title: "OHV Haltestellenfoerderung",
      active: true,
    },
  ]

  for (const data of seedData) {
    await db.survey.create({ data })
  }
}

export default seedSurveys
