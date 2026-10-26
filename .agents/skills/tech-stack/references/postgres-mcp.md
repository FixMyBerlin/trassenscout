# Postgres MCP (Claude Code)

[`@yawlabs/postgres-mcp`](https://www.npmjs.com/package/@yawlabs/postgres-mcp) via `bunx` — lets agents inspect schemas and run queries on your local DB.

Template: [examples/mcp.json.template](../examples/mcp.json.template)

Browser exploration: [agent-browser-mcp.md](agent-browser-mcp.md)

## Setup (user only)

**User scope only** (`--scope user`, stored in `~/.claude.json`). Never add Postgres MCP to a project `.mcp.json` — credentials must not be committed.

1. Add one server per DB, with `DATABASE_URL` from the app’s local `.env`:

   ```bash
   claude mcp add --scope user postgres-tilda-dev \
     --env DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/postgres \
     -- bunx -y @yawlabs/postgres-mcp@latest
   ```

   Or paste a server block from the template: `claude mcp add-json --scope user postgres-tilda-dev '<json>'`.

2. Start a new Claude Code session (CLI or desktop app Code tab) and check `/mcp` shows the server connected.

If `bunx` is missing from PATH, use the full path (e.g. `/opt/homebrew/bin/bunx`).

## Naming

One server per DB: `postgres-{app}-{env}` (e.g. `postgres-tilda-dev`, `postgres-tilda-staging`).

## Agent rules

- Use the MCP server that matches the environment the user means.
- Read-only by default — no writes unless the user explicitly asks on dev.
