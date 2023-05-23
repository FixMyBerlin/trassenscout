import { AuthClientPlugin } from "@blitzjs/auth"
import { setupBlitzClient } from "@blitzjs/next"
import { BlitzRpcPlugin } from "@blitzjs/rpc"
// https://github.com/total-typescript/ts-reset fixes .filter(Boolean) and similar cases
import "@total-typescript/ts-reset"

export const authConfig = {
  cookiePrefix: "rsv-builder",
}

export const { withBlitz } = setupBlitzClient({
  plugins: [AuthClientPlugin(authConfig), BlitzRpcPlugin({})],
})
