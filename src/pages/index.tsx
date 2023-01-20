import { BlitzPage } from "@blitzjs/next"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import PageHomeProjects from "src/home/components/PageHomeProjects"
import PageHomePublic from "src/home/components/PageHomePublic"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

const HomeWithQuery: BlitzPage = () => {
  const user = useCurrentUser()

  if (user) {
    return <PageHomeProjects />
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
