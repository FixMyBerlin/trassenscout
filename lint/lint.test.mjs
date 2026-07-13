import assert from "node:assert/strict"
import { describe, test } from "node:test"
import noAuthBoundaryImportPlugin from "./plugins/no-auth-boundary-import.mjs"
import noReExportPlugin from "./plugins/no-re-export.mjs"
import requireEndpointAuthPlugin from "./plugins/require-endpoint-auth.mjs"
import { isAuthBoundaryModuleImport } from "./utils/auth-boundary-imports.mjs"
import { bodyStartsWithEndpointAuth, hasValidReasonLiteral } from "./utils/endpoint-auth-ast.mjs"

describe("endpoint-auth-ast", () => {
  test("detects endpointAuth.public as first statement", () => {
    const body = {
      type: "BlockStatement",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: {
              type: "MemberExpression",
              object: { type: "Identifier", name: "endpointAuth" },
              property: { type: "Identifier", name: "public" },
            },
            arguments: [{ type: "Literal", value: "open by design" }],
          },
        },
      ],
    }
    assert.equal(bodyStartsWithEndpointAuth(body), true)
  })

  test("requires non-empty string literal for public/inherited", () => {
    const call = {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: { type: "Identifier", name: "endpointAuth" },
        property: { type: "Identifier", name: "public" },
      },
      arguments: [{ type: "Literal", value: "  " }],
    }
    assert.equal(hasValidReasonLiteral(call), false)
  })
})

describe("auth-boundary-imports", () => {
  test("flags session.server path", () => {
    assert.equal(isAuthBoundaryModuleImport("@/src/server/auth/session.server"), true)
  })

  test("allows endpointAuth.server path", () => {
    assert.equal(isAuthBoundaryModuleImport("@/src/server/auth/endpointAuth.server"), false)
  })
})

describe("trassenscout plugins", () => {
  test("each plugin exports exactly one rule", () => {
    assert.equal(Object.keys(requireEndpointAuthPlugin.rules).length, 1)
    assert.equal(Object.keys(noAuthBoundaryImportPlugin.rules).length, 1)
    assert.equal(Object.keys(noReExportPlugin.rules).length, 1)
    assert.ok(requireEndpointAuthPlugin.rules["require-endpoint-auth"])
    assert.ok(noAuthBoundaryImportPlugin.rules["no-auth-boundary-import"])
    assert.ok(noReExportPlugin.rules["no-re-export"])
  })

  test("no-auth-boundary-import flags session.server value import", () => {
    const rule = noAuthBoundaryImportPlugin.rules["no-auth-boundary-import"]
    const messages = []
    const context = {
      filename: "/project/src/server/contacts/contacts.server.ts",
      getFilename: () => "/project/src/server/contacts/contacts.server.ts",
      report(descriptor) {
        messages.push(descriptor)
      },
    }

    const listeners = rule.create(context)
    listeners.ImportDeclaration({
      importKind: "value",
      source: { type: "Literal", value: "@/src/server/auth/session.server" },
      specifiers: [
        {
          type: "ImportSpecifier",
          imported: { type: "Identifier", name: "getAppSession" },
        },
      ],
    })

    assert.equal(messages.length, 1)
    assert.match(messages[0].data.source, /session\.server/)
  })

  test("no-re-export flags pass-through export from", () => {
    const rule = noReExportPlugin.rules["no-re-export"]
    const messages = []
    const context = {
      filename: "/project/src/server/alkis/alkis.server.ts",
      getFilename: () => "/project/src/server/alkis/alkis.server.ts",
      report(descriptor) {
        messages.push(descriptor)
      },
    }

    const listeners = rule.create(context)
    listeners.ExportNamedDeclaration({
      source: { type: "Literal", value: "./alkis.inputSchemas" },
      specifiers: [{ type: "ExportSpecifier" }],
    })

    assert.equal(messages.length, 1)
    assert.equal(messages[0].data.source, "./alkis.inputSchemas")
  })

  test("no-re-export allows local export", () => {
    const rule = noReExportPlugin.rules["no-re-export"]
    const messages = []
    const context = {
      filename: "/project/src/server/alkis/alkis.server.ts",
      getFilename: () => "/project/src/server/alkis/alkis.server.ts",
      report(descriptor) {
        messages.push(descriptor)
      },
    }

    const listeners = rule.create(context)
    listeners.ExportNamedDeclaration({
      source: null,
      specifiers: [{ type: "ExportSpecifier" }],
    })

    assert.equal(messages.length, 0)
  })
})
