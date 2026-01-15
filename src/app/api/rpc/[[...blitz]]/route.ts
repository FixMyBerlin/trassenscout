import { withBlitzAuth } from "@/src/blitz-server"
import { rpcAppHandler } from "@blitzjs/rpc"

export const { GET, POST, HEAD } = withBlitzAuth(rpcAppHandler())
