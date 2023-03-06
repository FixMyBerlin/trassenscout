import { BlitzPage, Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import router from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import PageHomeNoProject from "src/home/components/PageHomeNoProject"
import PageHomeProjects from "src/home/components/PageHomeProjects"
import PageHomePublic from "src/home/components/PageHomePublic"
import getProjects from "src/projects/queries/getProjects"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

//

const HomeWithWithProjectsQuery: React.FC = () => {
  //const { query } = useRouter()
  const user = useCurrentUser()

  if (!user) {
    throw new Error("User required here.")
  }

  const projects = useQuery(
    getProjects,
    user.role === "ADMIN" ? {} : { where: { Membership: { some: { userId: user.id } } } }
  )[0].projects

  if (projects.length) {
    void router.push(Routes.ProjectDashboardPage({ projectSlug: projects[0]!.slug }))
    return <Spinner page />
  }

  return <PageHomeNoProject />
}

const HomeWithQuery: BlitzPage = () => {
  const user = useCurrentUser()

  if (user) {
    return <HomeWithWithProjectsQuery />
  }
  return <PageHomePublic />
}

const Home: BlitzPage = () => {
  return (
    <Suspense fallback={<Spinner page />}>
      <HomeWithQuery />
    </Suspense>
  )
}

export default Home
