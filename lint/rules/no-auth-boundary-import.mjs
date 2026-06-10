import { isAuthBoundaryModuleImport } from "../utils/auth-boundary-imports.mjs"

/** @type {import('eslint').Rule.RuleModule} */
export const noAuthBoundaryImport = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow value imports from auth boundary modules outside src/server/auth/ — use endpointAuth.server",
    },
    messages: {
      default:
        'Import endpointAuth from "@/src/server/auth/endpointAuth.server" instead of "{{source}}".',
    },
    schema: [],
  },
  create(context) {
    const filename = (context.filename ?? context.getFilename()).replaceAll("\\", "/")
    if (filename.includes("/src/server/auth/")) {
      return {}
    }

    return {
      ImportDeclaration(node) {
        if (node.importKind === "type") return
        const source = node.source
        if (source.type !== "Literal" || typeof source.value !== "string") return
        if (!isAuthBoundaryModuleImport(source.value)) return

        const hasValueSpecifiers = node.specifiers.some(
          (specifier) => specifier.type !== "ImportSpecifier" || specifier.importKind !== "type",
        )
        if (!hasValueSpecifiers) return

        context.report({
          node: source,
          messageId: "default",
          data: { source: source.value },
        })
      },
    }
  },
}
