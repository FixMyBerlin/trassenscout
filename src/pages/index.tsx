import { BlitzPage, Routes } from "@blitzjs/next"
import { Link } from "src/core/components/links"
import { Layout, MetaTags } from "src/core/layouts"

const Home: BlitzPage = () => {
  return (
    <Layout>
      <MetaTags title="RSV Startseite" />
      <div className="h-56">Startseite Logged Out UND Startseite Logged In</div>
      <ul>
        <li>
          <Link href={Routes.Rs8Index()}>RS8</Link>
        </li>
      </ul>
    </Layout>
  )
}

export default Home
