import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, ".env.test") })

async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for Playwright global setup")
  }
}

export default globalSetup
