import { getSession } from "@blitzjs/auth"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { GetServerSidePropsContext } from "next"
import router from "next/router"
import { Suspense } from "react"
import { api } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import { CurrentUser } from "../users/types"
import { Spinner } from "src/core/components/Spinner"
import PageHomeNoProject from "src/home/components/PageHomeNoProject"
import PageHomePublic from "src/home/components/PageHomePublic"
import getProjects from "src/projects/queries/getProjects"

const HomeWithWithProjectsQuery: React.FC = () => {
  const projects = useQuery(getProjects, {})[0].projects
  if (projects.length) {
    void router.push(Routes.ProjectDashboardPage({ projectSlug: projects[0]!.slug }))
    return <Spinner page />
  }

  return <PageHomeNoProject />
}

const Home: BlitzPage<{ user: CurrentUser }> = ({ user }) => {
  if (user) {
    return (
      <Suspense fallback={<Spinner page />}>
        <HomeWithWithProjectsQuery />
      </Suspense>
    )
  } else {
    return <PageHomePublic />
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context
  await api(() => null)
  const session = await getSession(req, res)
  // @ts-ignore session is all is needed
  const user = await getCurrentUser(null, { session })
  return {
    props: { user },
  }
}

export default Home
