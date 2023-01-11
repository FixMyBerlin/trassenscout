import { BlitzPage, Routes } from "@blitzjs/next"
import { Link } from "src/core/components/links"
import { Layout, MetaTags } from "src/core/layouts"

const Home: BlitzPage = () => {
  return (
    <Layout>
      <MetaTags title="RSV Startseite" />
      Startseite Logged Out UND Startseite Logged In
      <ul>
        <li>
          <Link href={Routes.Rs8Index()}>RS8</Link>
        </li>
      </ul>
    </Layout>
  )
}

export default Home
