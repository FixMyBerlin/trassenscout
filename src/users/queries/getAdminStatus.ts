import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  return {
    // `resolver.authorize("ADMIN")` will throw if `isAdmin: false`
    isAdmin: true,
  }
})
