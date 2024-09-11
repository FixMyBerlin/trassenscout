import { AuthServerPlugin, PrismaStorage, simpleRolesIsAuthorized } from "@blitzjs/auth"
import { setupBlitzServer } from "@blitzjs/next"
import { RpcServerPlugin } from "@blitzjs/rpc"
import type { BlitzCliConfig } from "blitz"
import { BlitzLogger } from "blitz"
import db from "db"
import { authConfig } from "./blitz-client"

export const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      ...authConfig,
      storage: PrismaStorage(db),
      isAuthorized: simpleRolesIsAuthorized,
    }),
    RpcServerPlugin({
      logging: {
        // allowList: [], // if allowList is defined then only those routes will be logged
        // blockList: [], // If blockList is defined then all routes except those will be logged
        // disablelevel: "debug", // info|debug Represents the flag to enable/disable logging for a particular level
        // verbose: true, // enable/disable logging If verbose is true then Blitz RPC will log the input and output of each resolver
      },
    }),
  ],
  logger: BlitzLogger({}),
})

export const cliConfig: BlitzCliConfig = {
  customTemplates: "src/core/templates",
}
