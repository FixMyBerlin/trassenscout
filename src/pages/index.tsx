import { BlitzPage } from "@blitzjs/next"
import { Layout, MetaTags } from "src/core/layouts"

const Home: BlitzPage = () => {
  return (
    <Layout>
      <MetaTags title="RSV Startseite" />
      Welcome Home.
    </Layout>
  )
}

export default Home
